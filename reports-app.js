(function () {
    const lang = window.REPORT_LANGUAGE || 'en';
    const data = window.REPORT_DATA;
    const labels = {
        en: {
            sent: 'Sent',
            scheduled: 'Scheduled',
            progress: 'In Production',
            topics: 'Upcoming Newsletter Topics',
            upcomingNewsletters: 'Upcoming Newsletters',
            view: 'View',
            reportMode: 'Report mode',
            exitReportMode: 'Exit report mode',
            wrongPassword: 'Wrong password'
        },
        zh: {
            sent: '已寄送',
            scheduled: '已排程',
            progress: '製作中',
            topics: '預計電子報主題',
            upcomingNewsletters: '預計發送電子報',
            view: '查看',
            reportMode: '報告模式',
            exitReportMode: '離開報告模式',
            wrongPassword: '密碼錯誤'
        }
    }[lang];

    const t = (value) => {
        if (Array.isArray(value)) return value;
        if (value && typeof value === 'object') return value[lang] || value.en || value.zh || '';
        return value || '';
    };

    const recordEl = document.getElementById('record');
    const presentationEl = document.getElementById('report');
    const navEl = document.getElementById('month-nav');
    const recordView = document.getElementById('record-view');
    const reportView = document.getElementById('report-view');
    const workspaceView = document.getElementById('workspace-view');
    const modeButton = document.getElementById('report-mode-toggle');
    const exitButton = document.getElementById('report-mode-exit');
    let activeReportId = new URLSearchParams(window.location.search).get('month') || location.hash.replace('#', '') || data.latest;

    function statusLabel(status) {
        return labels[status] || status;
    }

    function iconCalendar() {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    }

    function iconSection(path) {
        return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${path}</svg>`;
    }

    function renderPresentationEvent(event) {
        const link = event.url ? `<a href="${event.url}" class="event-link" target="_blank" rel="noopener">${labels.view}</a>` : '';
        const subtitle = t(event.subtitle) ? `<div class="event-subtitle">${t(event.subtitle)}</div>` : '';
        return `
            <div class="calendar-event">
                <div class="event-date">${event.date}<div class="event-subtitle">${t(event.month)}</div></div>
                <div class="event-content">
                    <div class="event-title">${t(event.title)}</div>
                    ${subtitle}
                    <div class="event-status status-${event.status}">${statusLabel(event.status)}</div>
                    ${link}
                </div>
            </div>
        `;
    }

    function renderPresentationSection(className, title, icon, body) {
        if (!body) return '';
        return `
            <section class="section ${className}">
                <h2 class="section-title">${icon}${title}</h2>
                ${body}
            </section>
        `;
    }

    function newsletterGroups(report) {
        const events = [...(report.sent || []), ...(report.scheduled || [])];
        return {
            sent: events.filter((event) => event.status === 'sent'),
            upcoming: events.filter((event) => event.status !== 'sent')
        };
    }

    function renderPresentationEventSection(events, className, title) {
        if (!events.length) return '';
        const body = `<div class="calendar-grid"><div class="calendar-month"><div class="calendar-events">${events.map(renderPresentationEvent).join('')}</div></div></div>`;
        return renderPresentationSection(className, title, iconSection('<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>'), body);
    }

    function renderPresentationTopics(report) {
        const topics = t(report.topics);
        if (!topics || !topics.length) return '';
        return renderPresentationSection('section-queue', t(report.topicsTitle) || labels.topics, iconSection('<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'), `<div class="glass-panel"><ul class="topic-list">${topics.map((topic) => `<li>${topic}</li>`).join('')}</ul></div>`);
    }

    function renderPresentation(report) {
        const groups = newsletterGroups(report);
        const sentTitle = t(report.sentTitle);
        const scheduledTitle = t(report.scheduledTitle) || labels.upcomingNewsletters;
        presentationEl.innerHTML = `
            <header class="report-header">
                <div class="date-badge">${iconCalendar()}${t(report.badge)}</div>
                <h1>${t(report.title)}</h1>
                <p>${t(report.subtitle)}</p>
            </header>
            <div class="content-grid">
                ${renderPresentationEventSection(groups.sent, 'section-newsletter', sentTitle)}
                ${renderPresentationEventSection(groups.upcoming, 'section-scheduled', scheduledTitle)}
                ${renderPresentationTopics(report)}
            </div>
        `;
    }

    function renderRecordEvent(event) {
        const subtitle = t(event.subtitle) ? `<div class="record-event-meta">${t(event.subtitle)}</div>` : '';
        const link = event.url ? `<a href="${event.url}" class="record-link" target="_blank" rel="noopener">${labels.view}</a>` : '';
        return `
            <div class="record-event ${event.status}">
                <div class="record-date">${event.date}<span>${t(event.month)}</span></div>
                <div class="record-event-body">
                    <div class="record-event-title">${t(event.title)}</div>
                    ${subtitle}
                    ${link}
                </div>
                <div class="record-status">${statusLabel(event.status)}</div>
            </div>
        `;
    }

    function renderRecordSection(title, itemsHtml, emptyText = '') {
        if (!itemsHtml && !emptyText) return '';
        return `
            <section class="record-section">
                <h2>${title}</h2>
                ${itemsHtml || `<p class="empty-note">${emptyText}</p>`}
            </section>
        `;
    }

    function renderRecordTopics(report) {
        const topics = t(report.topics);
        if (!topics || !topics.length) return '';
        const pills = `<div class="record-topic-list">${topics.map((topic) => `<span>${topic}</span>`).join('')}</div>`;
        return renderRecordSection(t(report.topicsTitle) || labels.topics, pills);
    }

    function renderRecord(report) {
        const groups = newsletterGroups(report);
        const sentTitle = t(report.sentTitle);
        const scheduledTitle = t(report.scheduledTitle) || labels.upcomingNewsletters;
        const sentSection = groups.sent.length
            ? renderRecordSection(sentTitle, `<div class="record-event-list">${groups.sent.map(renderRecordEvent).join('')}</div>`)
            : '';
        const scheduledSection = groups.upcoming.length
            ? renderRecordSection(scheduledTitle, `<div class="record-event-list">${groups.upcoming.map(renderRecordEvent).join('')}</div>`)
            : '';
        recordEl.innerHTML = `
            <header class="record-header">
                <p>${t(report.badge)}</p>
                <h1>${t(report.nav)} 2026</h1>
            </header>
            ${sentSection}
            ${scheduledSection}
            ${renderRecordTopics(report)}
        `;
    }

    function showView(view) {
        const isWorkspace = view === 'workspace';
        const isReport = view === 'report';
        recordView.classList.toggle('active', !isWorkspace && !isReport);
        reportView.classList.toggle('active', isReport);
        workspaceView.classList.toggle('active', isWorkspace);
        document.querySelectorAll('[data-view="workspace"]').forEach((item) => item.classList.toggle('active', isWorkspace));
    }

    function setReportMode(enabled) {
        document.body.classList.toggle('report-mode', enabled);
        modeButton.textContent = enabled ? labels.exitReportMode : labels.reportMode;
        showView(enabled ? 'report' : 'record');
    }

    function setActiveReport(id) {
        const report = data.reports.find((item) => item.id === id) || data.reports[0];
        activeReportId = report.id;
        renderRecord(report);
        renderPresentation(report);
        document.querySelectorAll('[data-report-id]').forEach((button) => {
            button.classList.toggle('active', button.dataset.reportId === report.id);
        });
        history.replaceState(null, '', `#${report.id}`);
        setReportMode(false);
    }

    function renderNav() {
        navEl.innerHTML = data.reports.map((report) => `
            <button class="nav-item" type="button" data-report-id="${report.id}">${t(report.nav)}</button>
        `).join('');
        navEl.addEventListener('click', (event) => {
            const button = event.target.closest('[data-report-id]');
            if (button) setActiveReport(button.dataset.reportId);
        });
    }

    document.querySelectorAll('[data-view="workspace"]').forEach((item) => {
        item.addEventListener('click', () => {
            setReportMode(false);
            showView('workspace');
        });
    });

    modeButton.addEventListener('click', () => {
        setReportMode(!document.body.classList.contains('report-mode'));
    });

    exitButton.addEventListener('click', () => {
        setReportMode(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('report-mode')) {
            setReportMode(false);
        }
    });

    window.checkPass = function checkPass() {
        const passInput = document.getElementById('pass-input');
        if (passInput.value === 'geogeo3356***') {
            document.getElementById('lock-screen').hidden = true;
            document.getElementById('internal-links').hidden = false;
        } else {
            alert(labels.wrongPassword);
        }
    };

    const passInput = document.getElementById('pass-input');
    if (passInput) {
        passInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') window.checkPass();
        });
    }

    renderNav();
    setActiveReport(activeReportId);
})();
