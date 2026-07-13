/** Local calendar date key (YYYY-MM-DD) for reliable same-day checks */
export const toLocalDateKey = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    if (value.includes('T')) {
      const part = value.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
        return part;
      }
    }
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const localTodayKey = () => toLocalDateKey(new Date());

export const isSameCalendarDay = (date1, date2) => {
  const k1 = toLocalDateKey(date1);
  const k2 = toLocalDateKey(date2);
  return Boolean(k1 && k2 && k1 === k2);
};

export const isPunchActive = (record) => {
  if (!record?.punchInTime) return false;
  const status = String(record.status || '').toUpperCase();
  if (status === 'PUNCHED_OUT') return false;
  if (record.punchOutTime) return false;
  if (status === 'PUNCHED_IN' || status === 'ACTIVE' || status === 'IN_PROGRESS') return true;
  // Active when punched in but status missing or non-terminal
  return status !== 'PUNCHED_OUT' && status !== 'ENDED' && status !== 'COMPLETED';
};

export const isPunchEnded = (record) => {
  if (!record) return false;
  const status = String(record.status || '').toUpperCase();
  return status === 'PUNCHED_OUT' || Boolean(record.punchOutTime);
};

/** Field visit still open (checked in, not checked out) */
export const isVisitActive = (visit) => {
  if (!visit?.checkInTime) return false;
  if (visit.checkOutTime) return false;
  const status = String(visit.status || '').toUpperCase();
  if (status === 'COMPLETED' || status === 'CHECKED_OUT' || status === 'CLOSED') return false;
  if (status === 'CHECKED_IN' || status === 'ACTIVE' || status === 'IN_PROGRESS') return true;
  return !visit.checkOutTime;
};

export const findActiveVisit = (visits, dateKey = localTodayKey()) => {
  if (!Array.isArray(visits)) return null;
  return (
    visits.find(
      (v) => v?.checkInTime && isSameCalendarDay(v.checkInTime, dateKey) && isVisitActive(v)
    ) || null
  );
};

export const parseCoord = (lat, lng) => {
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (Number.isFinite(la) && Number.isFinite(ln)) return { lat: la, lng: ln };
  return null;
};

export const visitCheckInCoords = (v) =>
  parseCoord(
    v?.checkInLatitude ?? v?.checkInLat ?? v?.latitude,
    v?.checkInLongitude ?? v?.checkInLng ?? v?.longitude
  );

export const visitCheckOutCoords = (v) =>
  parseCoord(
    v?.checkOutLatitude ?? v?.checkOutLat,
    v?.checkOutLongitude ?? v?.checkOutLng
  );

export const normalizeVisitRecord = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw.visit?.checkInTime ? raw.visit : raw;
  if (!v.checkInTime && !v.checkInLatitude) return v;
  const status = v.status || (v.checkOutTime ? 'COMPLETED' : 'CHECKED_IN');
  return { ...v, status };
};

export const mergeVisitLists = (fetched, previous) => {
  const list = Array.isArray(fetched) ? [...fetched] : [];
  const activeLocal = (previous || []).find(
    (v) => isVisitActive(v) && isSameCalendarDay(v.checkInTime, localTodayKey())
  );
  if (!activeLocal) return list;
  const idx = list.findIndex((v) => String(v?.id) === String(activeLocal.id));
  if (idx === -1) return [activeLocal, ...list];
  if (!isVisitActive(list[idx])) {
    const next = [...list];
    next[idx] = { ...list[idx], ...activeLocal, status: activeLocal.status || 'CHECKED_IN' };
    return next;
  }
  return list;
};

/** Prefer today's open punch; otherwise latest punch for today */
export const findTodayAttendance = (records, dateKey = localTodayKey()) => {
  if (!Array.isArray(records)) return null;
  const todayRecords = records.filter(
    (a) => a?.punchInTime && isSameCalendarDay(a.punchInTime, dateKey)
  );
  if (!todayRecords.length) return null;
  return todayRecords.find(isPunchActive) || todayRecords[todayRecords.length - 1];
};

export const extractAttendanceList = (response) => {
  const body = response?.data;
  const data = body?.data ?? body;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.attendance)) return data.attendance;
  if (Array.isArray(data?.logs)) return data.logs;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const extractVisitList = (response) => {
  const body = response?.data;
  const data = body?.data ?? body;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.visits)) return data.visits;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const normalizeAttendanceRecord = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.punchInTime) return raw;
  if (raw.attendance?.punchInTime) return raw.attendance;
  return raw;
};

/** Keep today's active punch from previous state if refetch omits it (API lag) */
export const mergeAttendanceLists = (fetched, previous) => {
  const list = Array.isArray(fetched) ? [...fetched] : [];
  const todayActive = (previous || []).find(
    (a) => a?.punchInTime && isPunchActive(a) && isSameCalendarDay(a.punchInTime, localTodayKey())
  );
  if (todayActive && !list.some((a) => String(a?.id) === String(todayActive.id))) {
    return [todayActive, ...list];
  }
  return list;
};
