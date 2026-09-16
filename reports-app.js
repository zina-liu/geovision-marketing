(function () {
    const lang = window.REPORT_LANGUAGE || 'en';
    const data = window.REPORT_DATA;
    const labels = {
        en: {
            sent: 'Sent',
            scheduled: 'Scheduled',
            progress: 'In Production',
            youtube: 'YouTube Updates',
            topics: 'Upcoming Newsletter Topics',
            view: 'View Content',
            watch: 'Watch Video',
            reportMode: 'Report Mode',
            exitReportMode: 'Exit Report Mode',
            wrongPassword: 'Wrong password'
        },
        zh: {
            sent: '已寄送',
            scheduled: '已排程',
            progress: '製作中',
            youtube: 'YouTube 影片更新',
            topics: '預計電子報主題',
            view: '查看內容',
            watch: '觀看影片',
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

    const reportEl = document.getElementById('report');
    const navEl = document.getElementById('month-nav');
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

    function renderEvent(event) {
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

    function renderSection(className, title, icon, body) {
        if (!body) return '';
        return `
            <section class="section ${className}">
                <h2 class="section-title">${icon}${title}</h2>
                ${body}
            </section>
        `;
    }

    function renderEventSection(report, key, className, title) {
        const events = report[key] || [];
        if (!events.length) return '';
        const body = `<div class="calendar-grid"><div class="calendar-month"><div class="calendar-header">${iconCalendar()}<span>${title}</span></div><div class="calendar-events">${events.map(renderEvent).join('')}</div></div></div>`;
        return renderSection(className, title, iconSection('<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>'), body);
    }

    function renderYoutube(report) {
        if (!report.youtube || !report.youtube.length) return '';
        const items = report.youtube.map((item) => `
            <li class="item">
                <div class="bullet-point"></div>
                <div>
                    <div class="item-text">${t(item.title)}</div>
                    ${t(item.note) ? `<div class="item-note">${t(item.note)}</div>` : ''}
                    <a href="${item.url}" class="file-link" target="_blank" rel="noopener">${labels.watch}</a>
                </div>
            </li>
        `).join('');
        return renderSection('section-youtube', t(report.youtubeTitle) || labels.youtube, iconSection('<path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/>'), `<div class="glass-panel"><ul class="item-list">${items}</ul></div>`);
    }

    function renderTopics(report) {
        const topics = t(report.topics);
        if (!topics || !topics.length) return '';
        return renderSection('section-queue', t(report.topicsTitle) || labels.topics, iconSection('<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'), `<div class="glass-panel"><ul class="topic-list">${topics.map((topic) => `<li>${topic}</li>`).join('')}</ul></div>`);
    }

    function renderReport(report) {
        reportEl.innerHTML = `
            <header class="report-header">
                <div class="date-badge">${iconCalendar()}${t(report.badge)}</div>
                <h1>${t(report.title)}</h1>
                <p>${t(report.subtitle)}</p>
            </header>
            <div class="content-grid">
                ${renderEventSection(report, 'sent', 'section-newsletter', t(report.sentTitle))}
                ${renderEventSection(report, 'scheduled', 'section-scheduled', t(report.scheduledTitle))}
                ${renderYoutube(report)}
                ${renderTopics(report)}
            </div>
        `;
    }

    function setActiveReport(id) {
        const report = data.reports.find((item) => item.id === id) || data.reports[0];
        activeReportId = report.id;
        renderReport(report);
        document.querySelectorAll('[data-report-id]').forEach((button) => {
            button.classList.toggle('active', button.dataset.reportId === report.id);
        });
        history.replaceState(null, '', `#${report.id}`);
        showView('report');
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

    function showView(view) {
        const isWorkspace = view === 'workspace';
        reportView.classList.toggle('active', !isWorkspace);
        workspaceView.classList.toggle('active', isWorkspace);
        document.querySelectorAll('[data-view="workspace"]').forEach((item) => item.classList.toggle('active', isWorkspace));
    }

    document.querySelectorAll('[data-view="workspace"]').forEach((item) => {
        item.addEventListener('click', () => showView('workspace'));
    });

    function setReportMode(enabled) {
        document.body.classList.toggle('report-mode', enabled);
        modeButton.textContent = document.body.classList.contains('report-mode') ? labels.exitReportMode : labels.reportMode;
        showView('report');
    }

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
