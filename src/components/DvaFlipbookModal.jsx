import React, { useState, useEffect, useRef } from 'react';
import axios, { getAccessToken } from '../api/axiosInstance';
import { API_ROUTE } from '../data/env';
import { useToast } from '../context/ToastContext';
import { getFullAssetUrl } from '../utils/getFullAssetUrl';
import { 
  X, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, 
  Loader2, Save, FileText, CheckSquare, Square
} from 'lucide-react';

export default function DvaFlipbookModal({ brochure, target, onClose }) {
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState(null);
  
  // Page lists & search states
  const [totalPages, setTotalPages] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0); // 0-indexed reference to visualPages array
  const [searchQuery, setSearchQuery] = useState('');
  
  // List of page definitions to be rendered in the slider
  // Format: { pageNumber: 1, title: '', desc: '', imgUrl: null, isPdfPage: false }
  const [allPages, setAllPages] = useState([]);
  const [visiblePages, setVisiblePages] = useState([]);
  
  // Zoom & presentation tracking state
  const [scale, setScale] = useState(1.0);
  const [productsShown, setProductsShown] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // PDF.js text contents index
  const [pdfTexts, setPdfTexts] = useState([]); // Array of strings representing text on each page

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // 1. Initialize pages and load PDF if PDF-based
  useEffect(() => {
    const initPages = async () => {
      setLoading(true);
      const isCustomBrochure = brochure.custom || brochure.isCustom;
      if (!isCustomBrochure && brochure.pdfUrl) {
        // PDF brochure
        try {
          const pdfjs = await loadPdfJs();
          // Load document
          const doc = await pdfjs.getDocument(getFullAssetUrl(brochure.pdfUrl)).promise;
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          
          // Build basic page list
          const pagesList = [];
          for (let i = 1; i <= doc.numPages; i++) {
            pagesList.push({
              pageNumber: i,
              title: `Page ${i}`,
              description: '',
              isPdfPage: true
            });
          }
          setAllPages(pagesList);
          setVisiblePages(pagesList);
          
          // Extract text contents for search indexing in background
          extractPdfTexts(doc);
        } catch (err) {
          console.error(err);
          showToast('Failed to load PDF visual aid file', 'error');
        } finally {
          setLoading(false);
        }
      } else {
        // Custom Image brochure
        const pagesList = (brochure.pages || []).map(p => ({
          pageNumber: p.pageNumber,
          title: p.title || `Slide ${p.pageNumber}`,
          description: p.description || '',
          imgUrl: p.imageUrl,
          keywords: (p.keywords || '').toLowerCase(),
          isPdfPage: false
        }));
        // Sort by pageNumber asc
        pagesList.sort((a, b) => a.pageNumber - b.pageNumber);
        setAllPages(pagesList);
        setVisiblePages(pagesList);
        setTotalPages(pagesList.length);
        setLoading(false);
      }
    };

    initPages();
  }, [brochure]);

  // Helper to dynamically load pdf.js from CDN
  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF loader script'));
      document.head.appendChild(script);
    });
  };

  // Index PDF texts in background
  const extractPdfTexts = async (doc) => {
    try {
      const texts = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ').toLowerCase();
        texts.push(pageText);
      }
      setPdfTexts(texts);
    } catch (e) {
      console.error('Failed to extract PDF texts for search indexing', e);
    }
  };

  // 2. Render active PDF page on Canvas
  useEffect(() => {
    if (!loading && pdfDoc && canvasRef.current && visiblePages.length > 0) {
      const activePage = visiblePages[activePageIndex];
      if (activePage && activePage.isPdfPage) {
        renderPage(activePage.pageNumber);
      }
    }
  }, [activePageIndex, visiblePages, loading, pdfDoc, scale]);

  const renderPage = async (pageNum) => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = page.getViewport({ scale: scale * 1.5 });
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Failed to render PDF page onto canvas', err);
    }
  };

  // 3. Handle swiping and keyword filtering
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setActivePageIndex(0); // Reset slider to first matched page

    if (!query.trim()) {
      setVisiblePages(allPages);
      return;
    }

    const term = query.toLowerCase().trim();
    // Split query into individual token words for tokenized search
    const tokens = term.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) {
      setVisiblePages(allPages);
      return;
    }

    const isCustomBrochure = brochure.custom || brochure.isCustom;
    if (isCustomBrochure) {
      // Filter custom page images (must match ALL search tokens)
      const filtered = allPages.filter(p => {
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const kws = (p.keywords || '').toLowerCase();

        return tokens.every(token => 
          title.includes(token) || 
          desc.includes(token) || 
          kws.includes(token)
        );
      });
      setVisiblePages(filtered);
    } else {
      // Filter PDF pages by checking indexed texts (must match ALL search tokens)
      try {
        const filtered = [];
        for (let i = 0; i < allPages.length; i++) {
          const p = allPages[i];
          let pageText = pdfTexts[p.pageNumber - 1];
          if (!pageText && pdfDoc) {
            const page = await pdfDoc.getPage(p.pageNumber);
            const textContent = await page.getTextContent();
            pageText = textContent.items.map(item => item.str).join(' ').toLowerCase();
            
            // Cache pageText locally
            setPdfTexts(prev => {
              const updated = [...prev];
              updated[p.pageNumber - 1] = pageText;
              return updated;
            });
          }
          
          const pageTextNoSpaces = (pageText || '').replace(/\s+/g, '');
          const title = (p.title || '').toLowerCase();
          
          const isMatch = tokens.every(token => {
            const tokenNoSpaces = token.replace(/\s+/g, '');
            return (
              (pageText && pageText.includes(token)) ||
              pageTextNoSpaces.includes(tokenNoSpaces) ||
              title.includes(token)
            );
          });
          
          if (isMatch) {
            filtered.push(p);
          }
        }
        setVisiblePages(filtered);
      } catch (err) {
        console.error('Error during dynamic PDF text search matching:', err);
      }
    }
  };

  // Turning page handlers
  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (activePageIndex < visiblePages.length - 1) {
      setActivePageIndex(prev => prev + 1);
    }
  };

  // Touch swiping triggers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    // Only turn pages if the swipe was primarily horizontal (horizontal swipe is wider than vertical drift)
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 60) {
        if (diffX > 0) {
          handleNextPage(); // swiped left (goes next)
        } else {
          handlePrevPage(); // swiped right (goes back)
        }
      }
    }
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.75));

  // 4. Save presentation session log to ZBM/Admin
  const handleSavePresentation = async () => {
    if (!target) {
      showToast('No doctor/chemist target selected. Closing...', 'info');
      onClose();
      return;
    }

    setIsSubmittingLog(true);
    showToast('Submitting presentation report...', 'loading');

    try {
      await axios.post(`${API_ROUTE}/visual-aids/presentations`, {
        visualAidId: brochure.id,
        clientType: target.type, // 'DOCTOR' or 'CHEMIST'
        clientId: target.id,
        clientName: target.fullName,
        presentedProducts: productsShown || brochure.title
      });

      showToast('Presentation successfully logged for your manager!', 'success');
      onClose();
    } catch (err) {
      showToast('Failed to log presentation details', 'error');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/98 z-[200] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <header className="h-[70px] bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-white">
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <FileText size={20} />
          </span>
          <div>
            <h2 className="text-md font-bold leading-tight">{brochure.title}</h2>
            {target ? (
              <p className="text-[11px] text-[#C8F04A] font-semibold">
                Detailing target: <span className="uppercase">({target.type})</span> {target.fullName}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">Presenting without target logging</p>
            )}
          </div>
        </div>

        {/* Dynamic Search Bar */}
        <div className="relative w-80 max-w-full hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search syrup, products, categories..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:border-[#C8F04A] transition-colors"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!brochure.custom && (
            <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button 
                onClick={zoomOut}
                className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg border-none bg-transparent cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={zoomIn}
                className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg border-none bg-transparent cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Slider Canvas / Viewport */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 relative overflow-y-auto"
      >
        {/* Navigation Arrow Left */}
        {visiblePages.length > 1 && (
          <button
            onClick={handlePrevPage}
            disabled={activePageIndex === 0}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 border border-slate-700 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-[10]"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Catalog page box */}
        <div className="w-full max-w-4xl max-h-[80vh] flex flex-col items-center justify-center relative bg-slate-950/40 border border-slate-800/40 p-4 rounded-3xl backdrop-blur-sm animate-in zoom-in duration-200">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400 py-20">
              <Loader2 className="animate-spin text-[#C8F04A]" size={40} />
              <span className="text-sm font-semibold">Loading brochure pages...</span>
            </div>
          ) : visiblePages.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <p className="text-md font-bold">No matching pages found</p>
              <p className="text-xs text-slate-500">Try searching for other keywords or categories.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-full max-h-full">
              {/* PDF Canvas Rendering */}
              {visiblePages[activePageIndex].isPdfPage ? (
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-[70vh] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-800"
                />
              ) : (
                // Custom Image Rendering
                <div className="relative max-w-full max-h-[65vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-850">
                  <img
                    src={getFullAssetUrl(visiblePages[activePageIndex].imgUrl)}
                    alt={visiblePages[activePageIndex].title}
                    className="max-w-full max-h-[65vh] object-contain"
                  />
                  
                  {/* Page overlays containing Custom page info if available */}
                  {(visiblePages[activePageIndex].title || visiblePages[activePageIndex].description) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 p-4 text-left">
                      <h4 className="text-white text-sm font-bold">{visiblePages[activePageIndex].title}</h4>
                      {visiblePages[activePageIndex].description && (
                        <p className="text-slate-400 text-xs mt-1">{visiblePages[activePageIndex].description}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Arrow Right */}
        {visiblePages.length > 1 && (
          <button
            onClick={handleNextPage}
            disabled={activePageIndex === visiblePages.length - 1}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 border border-slate-700 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-[10]"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom control bar (Presentation log tracking) */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-white text-xs">
          {visiblePages.length > 0 && (
            <span className="font-semibold text-slate-300">
              Slide {activePageIndex + 1} of {visiblePages.length} 
              {visiblePages.length < totalPages && ` (Filtered from ${totalPages})`}
            </span>
          )}
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-[11px]">Use Arrow Keys or Swipe to Navigate</span>
        </div>

        {/* Presentation log forms */}
        {target && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Products shown (e.g. CEFITAZ, CLARIDOT)..."
                value={productsShown}
                onChange={(e) => setProductsShown(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#C8F04A] transition-colors placeholder-slate-500"
              />
            </div>
            <button
              onClick={handleSavePresentation}
              disabled={isSubmittingLog}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#C8F04A] hover:bg-[#b0d63f] text-slate-900 font-bold rounded-xl text-xs transition-colors shadow-sm border-none cursor-pointer"
            >
              {isSubmittingLog ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Save size={14} />
              )}
              Log & Finish Detailing
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
