import React, { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function YearView({ date, events, onSelectEvent, localizer }) {
  const currentYear = date.getFullYear();
  const months = Array.from({ length: 12 }).map((_, i) => {
    return {
      monthIndex: i,
      monthEvents: events
        .filter((e) => e.start.getFullYear() === currentYear && e.start.getMonth() === i)
        .sort((a, b) => a.start - b.start),
    };
  });

  return (
    <div className="flex flex-col overflow-auto p-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map(({ monthIndex, monthEvents }) => {
          const monthDate = new Date(currentYear, monthIndex, 1);
          const monthName = localizer.format(monthDate, "MMMM");
          const handleMonthClick = () => {
            const event = new CustomEvent("calendarGoToMonth", { detail: { date: monthDate } });
            window.dispatchEvent(event);
          };

          return (
            <div key={monthIndex} className="bg-white rounded-xl border border-[#e5f1f8] p-4 shadow-sm">
              <h3
                onClick={handleMonthClick}
                className="font-semibold text-[#10212f] border-b border-[#e5f1f8] pb-2 mb-3 capitalize text-center cursor-pointer hover:text-blue-600 transition"
                title="Aller au mois de ce calendrier"
              >
                {monthName}
              </h3>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {monthEvents.map((e) => {
                  let bgColor = "bg-[#e5f1f8] text-[#10212f]";
                  if (e.type === "start") bgColor = "bg-blue-100 text-blue-800";
                  if (e.type === "end") bgColor = "bg-orange-100 text-orange-800";
                  if (e.type === "delivery") bgColor = "bg-green-100 text-green-800";

                  return (
                    <div
                      key={e.id}
                      onClick={() => onSelectEvent(e)}
                      className={`cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80 ${bgColor}`}
                    >
                      <span className="font-bold opacity-75 mr-1">
                        {localizer.format(e.start, "dd")}
                      </span>
                      {e.title}
                    </div>
                  );
                })}
                {monthEvents.length === 0 && (
                  <p className="text-center text-xs text-[#8ca0ad] py-4">Aucun événement</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

YearView.range = (date) => {
  return [new Date(date.getFullYear(), 0, 1), new Date(date.getFullYear(), 11, 31)];
};

YearView.navigate = (date, action) => {
  switch (action) {
    case "PREV":
      return new Date(date.getFullYear() - 1, date.getMonth(), 1);
    case "NEXT":
      return new Date(date.getFullYear() + 1, date.getMonth(), 1);
    default:
      return date;
  }
};

YearView.title = (date, { localizer }) => {
  return localizer.format(date, "yyyy");
};

function PlanView({ events, localizer, onSelectEvent, date }) {
  const rangeEvents = [...events].sort((a, b) => a.start - b.start);

  const grouped = {};
  rangeEvents.forEach(e => {
    const d = localizer.format(e.start, 'yyyy-MM-dd');
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  const today = new Date();
  const todayStr = localizer.format(today, 'yyyy-MM-dd');

  if (!grouped[todayStr]) {
    grouped[todayStr] = [];
  }

  const dates = Object.keys(grouped).sort();

  React.useEffect(() => {
    const dStr = localizer.format(date, 'yyyy-MM-dd');
    if (dStr === todayStr) {
      const el = document.getElementById("plan-today-block");
      if (el) {
        // Use a small timeout to ensure it's rendered and layout is ready
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      }
    }
  }, [date, todayStr, localizer]);

  return (
    <div className="flex flex-col overflow-auto p-4 h-full">
      {dates.length === 0 ? (
        <div className="text-center text-[#667785] mt-10">Aucun événement.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {dates.map(d => {
            const dayEvents = grouped[d];
            const [year, month, day] = d.split('-');
            const dateObj = new Date(year, month - 1, day);
            const titleDate = localizer.format(dateObj, 'EEEE dd MMMM yyyy');

            const isToday = d === todayStr;

            return (
              <div id={isToday ? "plan-today-block" : undefined} key={d} className={`bg-white rounded-xl border ${isToday ? 'border-blue-300 ring-2 ring-blue-50' : 'border-[#e5f1f8]'} shadow-sm overflow-hidden`}>
                <div className={`${isToday ? 'bg-blue-50 border-blue-200' : 'bg-[#f7fbfe] border-[#e5f1f8]'} px-4 py-3 border-b flex justify-between items-center`}>
                  <h3 className={`font-semibold capitalize ${isToday ? 'text-blue-800' : 'text-[#10212f]'}`}>
                    {titleDate}
                  </h3>
                  {isToday && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Aujourd'hui
                    </span>
                  )}
                </div>
                <div className="divide-y divide-[#edf4f8]">
                  {dayEvents.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-[#8ca0ad] italic">Aucun événement pour aujourd'hui.</div>
                  ) : dayEvents.map(e => {
                    let badgeColor = "bg-[#e5f1f8] text-[#10212f]";
                    let typeText = "Événement";
                    if (e.type === "start") { badgeColor = "bg-blue-100 text-blue-800"; typeText = "Début"; }
                    if (e.type === "end") { badgeColor = "bg-orange-100 text-orange-800"; typeText = "Fin"; }
                    if (e.type === "delivery") { badgeColor = "bg-green-100 text-green-800"; typeText = "Livraison"; }

                    const cleanTitle = e.title.replace(/\s\((Début|Fin|Livraison)\)$/, '');

                    return (
                      <div
                        key={e.id}
                        onClick={() => onSelectEvent(e)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-[#fafdff] cursor-pointer transition"
                      >
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badgeColor} w-20 text-center shrink-0`}>
                          {typeText}
                        </span>
                        <span className="font-medium text-[#10212f] text-sm">{cleanTitle}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

PlanView.title = () => {
  return "Toutes les commandes";
};

PlanView.navigate = (date) => {
  return date;
};

function CustomToolbar(toolbar) {
  const goToBack = () => toolbar.onNavigate("PREV");
  const goToNext = () => toolbar.onNavigate("NEXT");
  const goToCurrent = () => toolbar.onNavigate("TODAY");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <div className="flex items-center">
        <button
          onClick={goToCurrent}
          className="px-4 py-1.5 bg-white border border-[#e5f1f8] rounded-lg text-sm font-medium text-[#10212f] hover:bg-[#f7fbfe] transition"
        >
          {toolbar.localizer.messages.today}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={goToBack}
          className={`p-1.5 rounded-full transition ${toolbar.view === 'agenda' ? 'opacity-0 pointer-events-none' : 'text-[#667785] hover:text-[#10212f] hover:bg-[#f7fbfe]'}`}
          title={toolbar.localizer.messages.previous}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <span className="text-lg font-semibold text-[#10212f] capitalize w-48 text-center">
          {toolbar.label}
        </span>

        <button
          onClick={goToNext}
          className={`p-1.5 rounded-full transition ${toolbar.view === 'agenda' ? 'opacity-0 pointer-events-none' : 'text-[#667785] hover:text-[#10212f] hover:bg-[#f7fbfe]'}`}
          title={toolbar.localizer.messages.next}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="flex bg-[#f7fbfe] p-1 rounded-lg border border-[#e5f1f8]">
        {toolbar.views.map((viewName) => (
          <button
            key={viewName}
            onClick={() => toolbar.onView(viewName)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition capitalize ${toolbar.view === viewName ? 'bg-white shadow-sm text-[#0f73c4]' : 'text-[#667785] hover:text-[#10212f]'}`}
          >
            {toolbar.localizer.messages[viewName]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Calendar() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Active date for the calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  // Active view for the calendar
  const [currentView, setCurrentView] = useState(Views.MONTH);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [hideDelivered, setHideDelivered] = useState(() => {
    try { const s = localStorage.getItem("calendarFilters"); if (s) return JSON.parse(s).hideDelivered ?? false; } catch (e) {} return false;
  });
  const [showStart, setShowStart] = useState(() => {
    try { const s = localStorage.getItem("calendarFilters"); if (s) return JSON.parse(s).showStart ?? true; } catch (e) {} return true;
  });
  const [showEnd, setShowEnd] = useState(() => {
    try { const s = localStorage.getItem("calendarFilters"); if (s) return JSON.parse(s).showEnd ?? true; } catch (e) {} return true;
  });
  const [showDelivery, setShowDelivery] = useState(() => {
    try { const s = localStorage.getItem("calendarFilters"); if (s) return JSON.parse(s).showDelivery ?? true; } catch (e) {} return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem("calendarFilters", JSON.stringify({ hideDelivered, showStart, showEnd, showDelivery }));
    } catch (e) {}
  }, [hideDelivered, showStart, showEnd, showDelivery]);

  // Month/Year pickers
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    async function loadCalendar() {
      try {
        setLoading(true);
        const data = await apiFetch("/admin/calendar");
        setOrders(data);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, []);

  // Update currentDate when month/year dropdowns change
  useEffect(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(selectedMonth);
    newDate.setFullYear(selectedYear);
    setCurrentDate(newDate);
  }, [selectedMonth, selectedYear]);

  // Sync dropdowns when currentDate changes (e.g., via Prev/Next buttons)
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  useEffect(() => {
    const handleGoToMonth = (e) => {
      const targetDate = e.detail.date;
      setCurrentView(Views.MONTH);
      handleNavigate(targetDate);
    };

    window.addEventListener("calendarGoToMonth", handleGoToMonth);
    return () => window.removeEventListener("calendarGoToMonth", handleGoToMonth);
  }, []);

  const events = useMemo(() => {
    const allEvents = [];
    const lowerQuery = searchQuery.toLowerCase();

    orders.forEach((order) => {
      if (hideDelivered && order.status === "DELIVERED") {
        return;
      }

      const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
      if (searchQuery && !fullName.includes(lowerQuery)) {
        return;
      }

      const titlePrefix = `${order.first_name} ${order.last_name} — ${order.article_name}`;

      if (showStart && order.start_date) {
        allEvents.push({
          id: `${order.id}-start`,
          orderId: order.id,
          title: titlePrefix,
          start: new Date(order.start_date),
          end: new Date(order.start_date),
          type: "start",
        });
      }
      if (showEnd && order.end_date) {
        allEvents.push({
          id: `${order.id}-end`,
          orderId: order.id,
          title: titlePrefix,
          start: new Date(order.end_date),
          end: new Date(order.end_date),
          type: "end",
        });
      }
      if (showDelivery && order.delivery_date) {
        allEvents.push({
          id: `${order.id}-delivery`,
          orderId: order.id,
          title: titlePrefix,
          start: new Date(order.delivery_date),
          end: new Date(order.delivery_date),
          type: "delivery",
        });
      }
    });
    return allEvents;
  }, [orders, hideDelivered, showStart, showEnd, showDelivery, searchQuery]);

  const eventPropGetter = (event) => {
    let backgroundColor = "#3174ad"; // Default blue
    if (event.type === "start") backgroundColor = "#3b82f6"; // Blue
    if (event.type === "end") backgroundColor = "#f97316"; // Orange
    if (event.type === "delivery") backgroundColor = "#22c55e"; // Green

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0",
        display: "block",
        fontSize: "0.8rem",
        padding: "2px 4px",

      },
    };
  };

  const handleSelectEvent = (event) => {
    navigate(`/admin/orders/${event.orderId}`);
  };

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // +/- 5 years

  return (
    <div className="p-8 lg:p-1 flex flex-col h-screen overflow-hidden">

      {message && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 shrink-0">
          {message}
        </p>
      )}

      <div className="mt-1 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-[#e5f1f8] shadow-sm shrink-0 gap-4">
        {/* Date Jumpers */}
        <div className="flex items-center gap-3">
          {currentView !== "agenda" && (
            <span className="text-sm font-medium text-[#10212f]">Aller à :</span>
          )}

          {currentView !== "year" && currentView !== "agenda" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-[#e5f1f8] bg-[#f7fbfe] px-3 py-1.5 text-sm text-[#10212f] outline-none"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          )}

          {currentView !== "agenda" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-[#e5f1f8] bg-[#f7fbfe] px-3 py-1.5 text-sm text-[#10212f] outline-none"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex items-center mr-2">
            <svg className="w-4 h-4 text-[#8ca0ad] absolute left-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg border border-[#e5f1f8] bg-[#f7fbfe] text-sm text-[#10212f] outline-none focus:ring-1 focus:ring-blue-500 w-56 sm:w-64"
            />
          </div>

          <span className="text-sm font-medium text-[#10212f]">Afficher :</span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hideDelivered}
              onChange={() => setHideDelivered(!hideDelivered)}
              className="rounded text-gray-500 focus:ring-gray-500"
            />
            <span className="text-sm text-[#10212f]">Masquer les livrées</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showStart}
              onChange={() => setShowStart(!showStart)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-[#10212f] flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              Début
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showEnd}
              onChange={() => setShowEnd(!showEnd)}
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-[#10212f] flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
              Fin
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDelivery}
              onChange={() => setShowDelivery(!showDelivery)}
              className="rounded text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-[#10212f] flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Livraison
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex-1 bg-white rounded-3xl p-6 border border-[#e5f1f8] shadow-sm min-h-[500px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-[#667785]">Chargement du calendrier...</span>
          </div>
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            components={{
              toolbar: CustomToolbar
            }}
            views={{
              month: true,
              year: YearView,
              agenda: PlanView,
            }}
            defaultView={Views.MONTH}
            culture="fr"
            messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois",
              year: "Année",
              agenda: "Plan",
              date: "Date",
              time: "Heure",
              event: "Événement",
              noEventsInRange: "Aucun événement dans cette période.",
              allDay: "Toute la journée",
            }}
            eventPropGetter={eventPropGetter}
            onSelectEvent={handleSelectEvent}
            date={currentDate}
            onNavigate={handleNavigate}
            view={currentView}
            onView={(newView) => setCurrentView(newView)}
            popup
          />
        )}
      </div>
    </div>
  );
}

export default Calendar;
