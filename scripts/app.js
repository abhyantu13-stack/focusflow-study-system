let audioCtxShared = null;
let state = {
    tasks: [],
    filters: {
        status: "all",
        priority: "all",
        subject: "all",
        search: "",
        sortOrder: "default"
    },
    activeView: "dashboard",
    timer: {
        durationFocus: 25,
        durationBreak: 5,
        durationLongBreak: 15,
        stateSeconds: 1500,
        totalPhaseDuration: 1500,
        isRunning: false,
        countdownInterval: null,
        currentPhase: "Focus",
        pomodoroCount: 0,
        autoStart: false
    },
    settings: {
        theme: "dark",
        notificationsEnabled: false,
        rewardSystemEnabled: true,
        displayName: ""
    },
    rewards: {
        points: 0,
        streak: 0,
        lastActiveDate: null,
        pomodorosCompleted: 0,
        unlockedBadges: {
            first_task: false,
            five_tasks: false,
            timer_champ: false,
            streak_3: false
        }
    },
    studyPlan: {
        subjects: []
    },
    calendar: {
        currentDate: new Date(),
        viewMode: "grid"
    },
    reviewingPlan: false,
    activeTaskId: null,
    focusModeActive: false
};

const DOM = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheDOMReferences();
    loadDataFromLocalStorage();
    initializeSystemTheme();
    setupRoutingEngine();
    setupFormDateConstraints();
    registerEventListeners();
    refreshTimerDisplays();
    renderAllViews();
    updateBadgesDisplay();
    updatePomodoroDisplay();
    setupKeyboardShortcuts();
    checkWelcomeOnboarding();
});

function dismissLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.transition = "opacity 0.4s ease";
            setTimeout(() => {
                loader.style.display = "none";
                document.body.classList.add("loaded");
                const container = document.querySelector(".workspace");
                if (container) container.classList.add("revealed");
                checkForNearDeadlines();
            }, 400);
        }, 1200);
    }
}
if (document.readyState === "complete") {
    dismissLoader();
} else {
    window.addEventListener("load", dismissLoader);
}

function cacheDOMReferences() {
    DOM.sidebar = document.getElementById("mainSidebar");
    DOM.sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    DOM.navItems = document.querySelectorAll(".nav-item");
    DOM.viewPanels = document.querySelectorAll(".view-panel");
    DOM.sidebarTimerDisplay = document.getElementById("sidebarTimerDisplay");
    DOM.toastContainer = document.getElementById("toastContainer");
    DOM.dashboardGreeting = document.getElementById("dashboardGreeting");
    DOM.dashPendingCount = document.getElementById("dashPendingCount");
    DOM.dashCompletedCount = document.getElementById("dashCompletedCount");
    DOM.dashStudyTime = document.getElementById("dashStudyTime");
    DOM.dashOverdueCount = document.getElementById("dashOverdueCount");
    DOM.dashTodayTasks = document.getElementById("dashTodayTasks");
    DOM.dashTimerDisplay = document.getElementById("dashTimerDisplay");
    DOM.dashTimerPhase = document.getElementById("dashTimerPhase");
    DOM.dashStartPauseBtn = document.getElementById("dashStartPauseBtn");
    DOM.dashGoToTimerBtn = document.getElementById("dashGoToTimerBtn");
    DOM.quickAddTaskBtn = document.getElementById("quickAddTaskBtn");
    DOM.viewAllTasksLink = document.getElementById("viewAllTasksLink");
    DOM.rewardsDashboardPanel = document.getElementById("rewardsDashboardPanel");
    DOM.rewardPointsDisplay = document.getElementById("rewardPointsDisplay");
    DOM.rewardStreakDisplay = document.getElementById("rewardStreakDisplay");
    DOM.rewardLevelDisplay = document.getElementById("rewardLevelDisplay");
    DOM.rewardRankDisplay = document.getElementById("rewardRankDisplay");
    DOM.dashSyllabusTracker = document.getElementById("dashSyllabusTracker");
    DOM.openTaskModalBtn = document.getElementById("openTaskModalBtn");
    DOM.taskSearch = document.getElementById("taskSearch");
    DOM.statusFilter = document.getElementById("statusFilter");
    DOM.priorityFilter = document.getElementById("priorityFilter");
    DOM.subjectFilter = document.getElementById("subjectFilter");
    DOM.sortOrder = document.getElementById("sortOrder");
    DOM.tasksGrid = document.getElementById("tasksGrid");
    DOM.tasksEmptyState = document.getElementById("tasksEmptyState");
    DOM.mainTimerDisplay = document.getElementById("mainTimerDisplay");
    DOM.mainTimerPhase = document.getElementById("mainTimerPhase");
    DOM.timerProgressCircle = document.getElementById("timerProgressCircle");
    DOM.timerPresets = document.querySelectorAll(".preset-btn");
    DOM.mainStartPauseBtn = document.getElementById("mainStartPauseBtn");
    DOM.mainResetTimerBtn = document.getElementById("mainResetTimerBtn");
    DOM.enterFocusModeBtn = document.getElementById("enterFocusModeBtn");
    DOM.autoStartToggle = document.getElementById("autoStartToggle");
    DOM.studyPlanForm = document.getElementById("studyPlanForm");
    DOM.examDateInput = document.getElementById("examDate");
    DOM.syllabusChaptersInput = document.getElementById("syllabusChapters");
    DOM.focusModeOverlay = document.getElementById("focusModeOverlay");
    DOM.focusActiveTaskTitle = document.getElementById("focusActiveTaskTitle");
    DOM.focusTimerDisplay = document.getElementById("focusTimerDisplay");
    DOM.focusTimerPhase = document.getElementById("focusTimerPhase");
    DOM.focusProgressCircle = document.getElementById("focusProgressCircle");
    DOM.focusStartPauseBtn = document.getElementById("focusStartPauseBtn");
    DOM.focusResetTimerBtn = document.getElementById("focusResetTimerBtn");
    DOM.exitFocusModeBtn = document.getElementById("exitFocusModeBtn");
    DOM.settingDisplayName = document.getElementById("settingDisplayName");
    DOM.themeToggleSwitch = document.getElementById("themeToggleSwitch");
    DOM.rewardSystemToggleSwitch = document.getElementById("rewardSystemToggleSwitch");
    DOM.settingFocusDuration = document.getElementById("settingFocusDuration");
    DOM.settingBreakDuration = document.getElementById("settingBreakDuration");
    DOM.settingLongBreakDuration = document.getElementById("settingLongBreakDuration");
    DOM.settingAutoStartToggle = document.getElementById("settingAutoStartToggle");
    DOM.grantPermissionBtn = document.getElementById("grantPermissionBtn");
    DOM.clearAllTasksBtn = document.getElementById("clearAllTasksBtn");
    DOM.exportDataBtn = document.getElementById("exportDataBtn");
    DOM.importDataBtn = document.getElementById("importDataBtn");
    DOM.importFileInput = document.getElementById("importFileInput");
    DOM.taskModal = document.getElementById("taskModal");
    DOM.taskForm = document.getElementById("taskForm");
    DOM.modalTitle = document.getElementById("modalTitle");
    DOM.editTaskId = document.getElementById("editTaskId");
    DOM.taskTitle = document.getElementById("taskTitle");
    DOM.taskCategory = document.getElementById("taskCategory");
    DOM.taskDate = document.getElementById("taskDate");
    DOM.taskPriority = document.getElementById("taskPriority");
    DOM.taskDuration = document.getElementById("taskDuration");
    DOM.taskNotes = document.getElementById("taskNotes");
    DOM.closeModalBtn = document.getElementById("closeModalBtn");
    DOM.cancelModalBtn = document.getElementById("cancelModalBtn");
    DOM.formSubmitBtn = document.getElementById("formSubmitBtn");
    DOM.audioNotification = document.getElementById("audioNotification");
    DOM.timerContainer = document.getElementById("timerContainer");
    DOM.spotlightTaskTitle = document.getElementById("spotlightTaskTitle");
    DOM.spotlightTaskMeta = document.getElementById("spotlightTaskMeta");
    DOM.spotlightStartBtn = document.getElementById("spotlightStartBtn");
    DOM.spotlightViewTasksBtn = document.getElementById("spotlightViewTasksBtn");
    DOM.spotlightTimerVal = document.getElementById("spotlightTimerVal");
}

function loadDataFromLocalStorage() {
    try {
        const storedTasks = localStorage.getItem("focusflow_tasks");
        state.tasks = storedTasks ? JSON.parse(storedTasks) : [];
    } catch (e) {
        state.tasks = [];
    }
    
    try {
        const storedSettings = localStorage.getItem("focusflow_settings");
        if (storedSettings) {
            state.settings = { ...state.settings, ...JSON.parse(storedSettings) };
        } else {
            const darkThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
            state.settings.theme = darkThemeQuery.matches ? "dark" : "light";
        }
    } catch (e) {
        const darkThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        state.settings.theme = darkThemeQuery.matches ? "dark" : "light";
    }
    
    try {
        const storedTimer = localStorage.getItem("focusflow_timer_config");
        if (storedTimer) {
            const parsed = JSON.parse(storedTimer);
            state.timer.durationFocus = parsed.durationFocus || 25;
            state.timer.durationBreak = parsed.durationBreak || 5;
            state.timer.durationLongBreak = parsed.durationLongBreak || 15;
            state.timer.autoStart = parsed.autoStart || false;
        }
    } catch (e) {}
    state.timer.stateSeconds = state.timer.durationFocus * 60;
    state.timer.totalPhaseDuration = state.timer.stateSeconds;
    
    try {
        const storedRewards = localStorage.getItem("focusflow_rewards");
        if (storedRewards) {
            state.rewards = { ...state.rewards, ...JSON.parse(storedRewards) };
        }
    } catch (e) {}
    
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (state.rewards.lastActiveDate && state.rewards.lastActiveDate !== today && state.rewards.lastActiveDate !== yesterday) {
        state.rewards.streak = 0;
    }
    
    const storedPlan = localStorage.getItem("focusflow_study_plan");
    if (storedPlan) {
        try {
            const parsedPlan = JSON.parse(storedPlan);
            if (parsedPlan.subjects) {
                state.studyPlan = parsedPlan;
            } else if (parsedPlan.syllabusChapters > 0) {
                state.studyPlan = {
                    subjects: [{
                        id: "subj_legacy",
                        name: "General Syllabus",
                        examDate: parsedPlan.examDate || "",
                        chaptersCount: parsedPlan.syllabusChapters || 0,
                        completedChapters: parsedPlan.completedChapters || [],
                        completed: parsedPlan.completed || false
                    }]
                };
            } else {
                state.studyPlan = { subjects: [] };
            }
        } catch (e) {
            state.studyPlan = { subjects: [] };
        }
    } else {
        state.studyPlan = { subjects: [] };
    }
    
    state.reviewingPlan = false;
    
    if (DOM.settingFocusDuration) DOM.settingFocusDuration.value = state.timer.durationFocus;
    if (DOM.settingBreakDuration) DOM.settingBreakDuration.value = state.timer.durationBreak;
    if (DOM.settingLongBreakDuration) DOM.settingLongBreakDuration.value = state.timer.durationLongBreak;
    if (DOM.themeToggleSwitch) DOM.themeToggleSwitch.checked = (state.settings.theme === "dark");
    if (DOM.rewardSystemToggleSwitch) DOM.rewardSystemToggleSwitch.checked = state.settings.rewardSystemEnabled;
    if (DOM.settingDisplayName) DOM.settingDisplayName.value = state.settings.displayName || "";
    if (DOM.settingAutoStartToggle) DOM.settingAutoStartToggle.checked = state.timer.autoStart;
    if (DOM.autoStartToggle) DOM.autoStartToggle.checked = state.timer.autoStart;
    
    updateGreetingDisplay();
    renderRewardsDisplays();
    updateLevelSystem();
    syncPresetButtonsText();
}

function saveDataToLocalStorage() {
    localStorage.setItem("focusflow_tasks", JSON.stringify(state.tasks));
    localStorage.setItem("focusflow_settings", JSON.stringify(state.settings));
    localStorage.setItem("focusflow_timer_config", JSON.stringify({
        durationFocus: state.timer.durationFocus,
        durationBreak: state.timer.durationBreak,
        durationLongBreak: state.timer.durationLongBreak,
        autoStart: state.timer.autoStart
    }));
    localStorage.setItem("focusflow_rewards", JSON.stringify(state.rewards));
    localStorage.setItem("focusflow_study_plan", JSON.stringify(state.studyPlan));
}

function syncPresetButtonsText() {
    const focusBtn = document.querySelector('.preset-btn[data-phase="Focus"]');
    if (focusBtn) {
        focusBtn.setAttribute('data-duration', state.timer.durationFocus);
        focusBtn.innerText = `${state.timer.durationFocus}m Focus`;
    }
    const breakBtn = document.querySelector('.preset-btn[data-phase="Short Break"]');
    if (breakBtn) {
        breakBtn.setAttribute('data-duration', state.timer.durationBreak);
        breakBtn.innerText = `${state.timer.durationBreak}m Break`;
    }
    const longBtn = document.querySelector('.preset-btn[data-phase="Long Break"]');
    if (longBtn) {
        longBtn.setAttribute('data-duration', state.timer.durationLongBreak);
        longBtn.innerText = `${state.timer.durationLongBreak}m Break`;
    }
}

function initializeSystemTheme() {
    document.documentElement.setAttribute("data-theme", state.settings.theme);
}

function toggleSystemTheme(isDark) {
    state.settings.theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", state.settings.theme);
    saveDataToLocalStorage();
    showToast(`Atmosphere set to ${state.settings.theme === "dark" ? "Deep Dark" : "Daylight Clarity"}.`, "info");
}

function setupRoutingEngine() {
    DOM.navItems.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = link.getAttribute("data-tab");
            switchView(targetView);
            closeMobileSidebar();
        });
    });

    if (DOM.dashGoToTimerBtn) {
        DOM.dashGoToTimerBtn.addEventListener("click", () => {
            switchView("progress");
        });
    }

    if (DOM.viewAllTasksLink) {
        DOM.viewAllTasksLink.addEventListener("click", (e) => {
            e.preventDefault();
            switchView("tasks");
        });
    }
}

function switchView(viewName) {
    state.activeView = viewName;
    DOM.navItems.forEach(link => {
        if (link.getAttribute("data-tab") === viewName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
    DOM.viewPanels.forEach(panel => {
        if (panel.id === `${viewName}View`) {
            panel.classList.add("active");
        } else {
            panel.classList.remove("active");
        }
    });
    
    // Update Page Title
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
        let displayTitle = "Dashboard";
        if (viewName === "planner") displayTitle = "Study Planner";
        else if (viewName === "tasks") displayTitle = "Tasks";
        else if (viewName === "progress") displayTitle = "Focus Engine";
        else if (viewName === "settings") displayTitle = "Settings";
        pageTitle.innerText = displayTitle;
    }
    
    renderAllViews();
}

function updateGreetingDisplay() {
    const name = state.settings.displayName || "Student";
    if (DOM.dashboardGreeting) {
        DOM.dashboardGreeting.innerText = `Welcome back, ${name}!`;
    }
    const profileName = document.getElementById("profileName");
    if (profileName) {
        profileName.innerText = name;
    }
    const userAvatar = document.getElementById("userAvatar");
    if (userAvatar) {
        userAvatar.innerText = name.charAt(0).toUpperCase();
    }
}

function animateValue(element, start, end, duration = 600) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerText = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderAllViews() {
    if (state.activeView === "dashboard") {
        renderDashboardView();
    } else if (state.activeView === "tasks") {
        renderTasksView();
    } else if (state.activeView === "planner") {
        renderPlannerView();
    } else if (state.activeView === "progress") {
        refreshTimerDisplays();
        renderRewardsDisplays();
        updateBadgesDisplay();
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderDashboardView() {
    const todayStr = new Date().toISOString().split("T")[0];
    const pendingTasks = state.tasks.filter(t => !t.completed);
    const pendingCount = pendingTasks.length;
    const completedCount = state.tasks.filter(t => t.completed).length;
    
    let studySecsToday = 0;
    const storedDurationToday = localStorage.getItem(`focusflow_study_time_${todayStr}`);
    if (storedDurationToday) {
        studySecsToday = parseInt(storedDurationToday, 10);
    }
    const hours = Math.floor(studySecsToday / 3600);
    const mins = Math.floor((studySecsToday % 3600) / 60);
    
    const now = Date.now();
    const overdueTasks = pendingTasks.filter(t => new Date(t.date).getTime() < now);
    const overdueCount = overdueTasks.length;
    
    if (DOM.dashPendingCount) animateValue(DOM.dashPendingCount, 0, pendingCount, 500);
    if (DOM.dashCompletedCount) animateValue(DOM.dashCompletedCount, 0, completedCount, 500);
    if (DOM.dashStudyTime) DOM.dashStudyTime.innerText = `${hours}h ${mins}m`;
    if (DOM.dashOverdueCount) animateValue(DOM.dashOverdueCount, 0, overdueCount, 500);
    
    // SPOTLIGHT ATTENTION HERO CARD UPDATE
    let spotlightTask = null;
    if (overdueCount > 0) {
        spotlightTask = overdueTasks[0];
    } else {
        const highPriority = pendingTasks.filter(t => t.priority === "high");
        if (highPriority.length > 0) {
            spotlightTask = highPriority[0];
        } else {
            const todayTasks = pendingTasks.filter(t => t.date && t.date.split("T")[0] === todayStr);
            if (todayTasks.length > 0) {
                spotlightTask = todayTasks[0];
            } else if (pendingTasks.length > 0) {
                spotlightTask = pendingTasks[0];
            }
        }
    }

    if (spotlightTask && DOM.spotlightTaskTitle && DOM.spotlightTaskMeta) {
        state.activeTaskId = spotlightTask.id;
        DOM.spotlightTaskTitle.innerText = spotlightTask.title;
        const dueStr = new Date(spotlightTask.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        DOM.spotlightTaskMeta.innerText = `Subject: ${spotlightTask.category} • Priority: ${spotlightTask.priority.toUpperCase()} • Estimate: ${spotlightTask.duration} mins • Target: ${dueStr}`;
    } else if (DOM.spotlightTaskTitle && DOM.spotlightTaskMeta) {
        state.activeTaskId = null;
        DOM.spotlightTaskTitle.innerText = "No pending urgent tasks";
        DOM.spotlightTaskMeta.innerText = "Add a task or launch a Pomodoro session to kickstart your study block.";
    }
    
    // Due Today list
    if (DOM.dashTodayTasks) {
        DOM.dashTodayTasks.innerHTML = "";
        const todayTasks = state.tasks.filter(task => {
            if (!task.date) return false;
            const taskDatePart = task.date.split("T")[0];
            return taskDatePart === todayStr;
        });
        
        if (todayTasks.length === 0) {
            DOM.dashTodayTasks.innerHTML = `
                <div class="today-empty-state">
                    <i data-lucide="calendar-check"></i>
                    <p>No study tasks due today. Keep it up!</p>
                </div>
            `;
        } else {
            todayTasks.forEach(task => {
                const parseDate = new Date(task.date);
                const formattedTime = parseDate.toLocaleTimeString(undefined, {
                    hour: '2-digit', minute: '2-digit'
                });
                const taskRow = document.createElement("div");
                taskRow.className = `today-task-row priority-${task.priority}`;
                taskRow.innerHTML = `
                    <div class="today-task-info">
                        <input type="checkbox" class="today-task-checkbox today-task-check" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                        <span class="today-task-title ${task.completed ? 'done' : ''}">${sanitizeData(task.title)}</span>
                    </div>
                    <div class="today-task-meta">
                        <span class="today-task-badge" style="background-color: rgba(99, 102, 241, 0.12); color: var(--accent);"><i data-lucide="tag" style="width:10px;height:10px;display:inline;"></i> ${sanitizeData(task.category)}</span>
                        <span class="today-task-badge" style="background-color: rgba(255, 255, 255, 0.04); color: var(--text-secondary);"><i data-lucide="clock" style="width:10px;height:10px;display:inline;"></i> ${formattedTime}</span>
                        <button class="btn-task-focus-start" data-id="${task.id}" title="Focus on this task"><i data-lucide="play" style="width:10px;height:10px;"></i> Focus</button>
                    </div>
                `;
                taskRow.querySelector(".today-task-check").addEventListener("change", (e) => {
                    toggleTaskCompletion(task.id, e.target.checked);
                });
                taskRow.querySelector(".btn-task-focus-start").addEventListener("click", () => {
                    state.activeTaskId = task.id;
                    enterFocusMode();
                });
                DOM.dashTodayTasks.appendChild(taskRow);
            });
        }
    }

    // Syllabus Subjects progress rows
    if (state.studyPlan && state.studyPlan.subjects && state.studyPlan.subjects.length > 0) {
        if (DOM.dashSyllabusTracker) {
            DOM.dashSyllabusTracker.style.display = "block";
            const trackerContainer = DOM.dashSyllabusTracker.querySelector(".planner-progress-section");
            if (trackerContainer) {
                trackerContainer.innerHTML = "";
                state.studyPlan.subjects.forEach(subject => {
                    const percent = subject.chaptersCount > 0 ? Math.round((subject.completedChapters.length / subject.chaptersCount) * 100) : 0;
                    const progressItem = document.createElement("div");
                    progressItem.className = "dash-subject-progress-row";
                    progressItem.style.marginBottom = "14px";
                    progressItem.innerHTML = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.82rem;">
                            <span style="font-weight: 600; color: var(--text-primary);"><i data-lucide="book-open" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> ${sanitizeData(subject.name)}</span>
                            <span style="font-weight: 700; color: var(--accent);">${percent}%</span>
                        </div>
                        <div class="progress-bar-container" style="background: var(--border); height: 6px; border-radius: 3px; overflow: hidden; width: 100%;">
                            <div class="progress-bar-fill" style="width: ${percent}%; height: 100%; background: var(--accent); transition: width 0.3s ease;"></div>
                        </div>
                    `;
                    trackerContainer.appendChild(progressItem);
                });
            }
        }
    } else {
        if (DOM.dashSyllabusTracker) DOM.dashSyllabusTracker.style.display = "none";
    }
}

function renderTasksView() {
    populateSubjectFilter();
    
    if (state.calendar.viewMode === "calendar") {
        if (DOM.tasksGrid) DOM.tasksGrid.style.display = "none";
        const calView = document.getElementById("tasksCalendar");
        if (calView) calView.style.display = "block";
        renderTasksCalendar();
        return;
    } else {
        if (DOM.tasksGrid) DOM.tasksGrid.style.display = "grid";
        const calView = document.getElementById("tasksCalendar");
        if (calView) calView.style.display = "none";
    }
    
    let filtered = [...state.tasks];
    
    if (state.filters.status === "pending") {
        filtered = filtered.filter(t => !t.completed);
    } else if (state.filters.status === "completed") {
        filtered = filtered.filter(t => t.completed);
    }
    
    if (state.filters.priority !== "all") {
        filtered = filtered.filter(t => t.priority === state.filters.priority);
    }
    
    if (state.filters.subject !== "all") {
        filtered = filtered.filter(t => t.category.toLowerCase().trim() === state.filters.subject.toLowerCase().trim());
    }
    
    if (state.filters.search) {
        const query = state.filters.search.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
    }
    
    if (state.filters.sortOrder === "due_asc") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (state.filters.sortOrder === "due_desc") {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (state.filters.sortOrder === "priority") {
        const pMap = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => pMap[b.priority] - pMap[a.priority]);
    } else if (state.filters.sortOrder === "duration") {
        filtered.sort((a, b) => b.duration - a.duration);
    } else if (state.filters.sortOrder === "newest") {
        filtered.sort((a, b) => b.id - a.id);
    } else if (state.filters.sortOrder === "oldest") {
        filtered.sort((a, b) => a.id - b.id);
    }
    
    if (DOM.tasksGrid) {
        DOM.tasksGrid.innerHTML = "";
        if (filtered.length === 0) {
            if (DOM.tasksEmptyState) DOM.tasksEmptyState.style.display = "block";
        } else {
            if (DOM.tasksEmptyState) DOM.tasksEmptyState.style.display = "none";
            
            const nowTime = Date.now();
            filtered.forEach(task => {
                const parseDate = new Date(task.date);
                const formatStr = parseDate.toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const isOverdue = !task.completed && parseDate.getTime() < nowTime;
                
                const node = document.createElement("div");
                node.className = `task-node priority-${task.priority} ${task.completed ? 'completed-state' : ''} ${isOverdue ? 'overdue-node' : ''}`;
                if (isOverdue) node.style.borderLeft = "4px solid var(--danger)";
                node.setAttribute("data-task-id", task.id);
                
                node.innerHTML = `
                    <div class="task-node-header">
                        <span class="task-node-subject">${sanitizeData(task.category)}</span>
                        <div class="task-node-actions">
                            <button class="task-node-action-btn action-check" title="Toggle status"><i data-lucide="${task.completed ? 'check-circle-2' : 'circle'}"></i></button>
                            <button class="task-node-action-btn action-edit" title="Edit task"><i data-lucide="edit"></i></button>
                            <button class="task-node-action-btn action-duplicate" title="Duplicate task"><i data-lucide="copy"></i></button>
                            <button class="task-node-action-btn action-delete" title="Delete task"><i data-lucide="trash-2"></i></button>
                        </div>
                    </div>
                    <h4 class="task-node-title ${task.completed ? 'done' : ''}">${sanitizeData(task.title)}</h4>
                    ${task.notes ? `<p class="task-node-notes">${sanitizeData(task.notes)}</p>` : ''}
                    <div class="task-node-footer">
                        <span class="task-node-deadline"><i data-lucide="calendar"></i> ${formatStr}</span>
                        <span class="task-node-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                `;
                
                node.querySelector(".action-check").addEventListener("click", () => {
                    toggleTaskCompletion(task.id, !task.completed);
                });
                node.querySelector(".action-edit").addEventListener("click", () => {
                    openEditTaskModal(task.id);
                });
                node.querySelector(".action-duplicate").addEventListener("click", () => {
                    duplicateTask(task.id);
                });
                node.querySelector(".action-delete").addEventListener("click", () => {
                    deleteTask(task.id);
                });
                
                DOM.tasksGrid.appendChild(node);
            });
        }
    }
}

function renderPlannerView() {
    const subjectsGrid = document.getElementById("subjectsGrid");
    if (!subjectsGrid) return;
    
    subjectsGrid.innerHTML = "";
    
    if (!state.studyPlan.subjects || state.studyPlan.subjects.length === 0) {
        subjectsGrid.innerHTML = `
            <div class="empty-state-card" style="grid-column: 1 / -1;">
                <div class="empty-graphic"><i data-lucide="book-open"></i></div>
                <h4>No Subject Roadmaps Yet</h4>
                <p>Add a subject with its target exam date and chapter count to generate checklists.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    state.studyPlan.subjects.forEach(subject => {
        const percent = subject.chaptersCount > 0 ? Math.round((subject.completedChapters.length / subject.chaptersCount) * 100) : 0;
        const allCompleted = subject.completedChapters.length === subject.chaptersCount;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const exam = new Date(subject.examDate);
        exam.setHours(0,0,0,0);
        const diffTime = exam - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let daysStr = "Passed";
        if (diffDays > 0) daysStr = `${diffDays} days left`;
        else if (diffDays === 0) daysStr = "Exam today!";
        
        let checklistHTML = "";
        for (let i = 1; i <= subject.chaptersCount; i++) {
            const isChecked = subject.completedChapters.includes(i);
            const disabledStr = subject.completed ? "disabled" : "";
            checklistHTML += `
                <div class="chapter-check-item" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
                    <input type="checkbox" id="chapter_${subject.id}_${i}" data-subj="${subject.id}" data-chap="${i}" class="chapter-checkbox" ${isChecked ? "checked" : ""} ${disabledStr} style="cursor: pointer; accent-color: var(--accent);">
                    <label for="chapter_${subject.id}_${i}" class="chapter-label ${isChecked ? 'done' : ''}" style="color: ${isChecked ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${isChecked ? 'line-through' : 'none'}; cursor: pointer;">Ch. ${i}</label>
                </div>
            `;
        }
        
        let actionButtonHTML = "";
        if (subject.completed) {
            actionButtonHTML = `
                <div class="subject-completed-badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); color: var(--success); text-align: center; padding: 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">
                    All chapters completed 🎉
                </div>
            `;
        } else if (allCompleted) {
            actionButtonHTML = `
                <button class="btn btn-primary finish-plan-btn" data-id="${subject.id}" style="width: 100%; font-weight: 600;">
                    Finish Plan
                </button>
            `;
        }
        
        const card = document.createElement("div");
        card.className = "subject-plan-card";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${sanitizeData(subject.name)}</h3>
                    <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: var(--text-secondary);"><i data-lucide="calendar" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Target: ${subject.examDate} (${daysStr})</p>
                </div>
                <button class="delete-subject-btn" data-id="${subject.id}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px;" title="Delete subject plan">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
            
            <div class="progress-section">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.8rem; font-weight: 500;">
                    <span style="color: var(--text-secondary);">Mastery Progress</span>
                    <span style="color: var(--accent); font-weight: 700;">${percent}%</span>
                </div>
                <div class="progress-bar-container" style="background: var(--border); height: 6px; border-radius: 3px; overflow: hidden; width: 100%;">
                    <div class="progress-bar-fill" style="width: ${percent}%; height: 100%; background: var(--accent); transition: width 0.3s ease;"></div>
                </div>
            </div>
            
            <div class="chapters-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 8px; border-top: 1px solid var(--border); padding-top: 14px; max-height: 140px; overflow-y: auto;">
                ${checklistHTML}
            </div>
            
            <div class="card-footer-action" style="margin-top: auto; border-top: 1px dashed var(--border); padding-top: 12px;">
                ${actionButtonHTML}
            </div>
        `;
        
        card.querySelectorAll(".chapter-checkbox").forEach(box => {
            box.addEventListener("change", (e) => {
                const sId = box.getAttribute("data-subj");
                const cNum = parseInt(box.getAttribute("data-chap"), 10);
                toggleChapterProgress(sId, cNum, e.target.checked);
            });
        });
        
        card.querySelector(".delete-subject-btn").addEventListener("click", () => {
            deleteSubjectPlan(subject.id);
        });
        
        const finishBtn = card.querySelector(".finish-plan-btn");
        if (finishBtn) {
            finishBtn.addEventListener("click", () => {
                finishSubjectPlan(subject.id);
            });
        }
        
        subjectsGrid.appendChild(card);
    });
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleStudyPlanGeneration(e) {
    e.preventDefault();
    const subjectName = document.getElementById("subjectName").value.trim();
    const examDate = DOM.examDateInput.value;
    const chaptersVal = parseInt(DOM.syllabusChaptersInput.value, 10);
    
    if (!subjectName || !examDate || isNaN(chaptersVal) || chaptersVal <= 0) {
        showToast("Provide all plan fields.", "error");
        return;
    }
    
    if (!state.studyPlan.subjects) state.studyPlan.subjects = [];
    
    const existingIdx = state.studyPlan.subjects.findIndex(s => s.name.toLowerCase() === subjectName.toLowerCase());
    const newSubject = {
        id: existingIdx !== -1 ? state.studyPlan.subjects[existingIdx].id : 'subj_' + Date.now(),
        name: subjectName,
        examDate: examDate,
        chaptersCount: chaptersVal,
        completedChapters: existingIdx !== -1 ? state.studyPlan.subjects[existingIdx].completedChapters : [],
        completed: existingIdx !== -1 ? state.studyPlan.subjects[existingIdx].completed : false
    };
    
    if (existingIdx !== -1) {
        state.studyPlan.subjects[existingIdx] = newSubject;
        showToast(`Subject "${subjectName}" updated.`, "success");
    } else {
        state.studyPlan.subjects.push(newSubject);
        showToast(`Subject "${subjectName}" roadmap generated.`, "success");
    }
    
    saveDataToLocalStorage();
    renderPlannerView();
    renderDashboardView();
    
    document.getElementById("subjectName").value = "";
    DOM.examDateInput.value = "";
    DOM.syllabusChaptersInput.value = "";
    confettiBurst();
}

function toggleChapterProgress(subjectId, chapterNum, isChecked) {
    const subject = state.studyPlan.subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    const idx = subject.completedChapters.indexOf(chapterNum);
    if (isChecked) {
        if (idx === -1) {
            subject.completedChapters.push(chapterNum);
            awardPoints(5);
            showToast(`Chapter ${chapterNum} completed. +5 XP earned.`, "success");
        }
    } else {
        if (idx !== -1) subject.completedChapters.splice(idx, 1);
    }
    
    saveDataToLocalStorage();
    renderPlannerView();
    renderDashboardView();
}

function finishSubjectPlan(subjectId) {
    const subject = state.studyPlan.subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    subject.completed = true;
    awardPoints(50);
    
    saveDataToLocalStorage();
    renderPlannerView();
    renderDashboardView();
    
    showToast("All chapters completed 🎉", "success");
    confettiBurst();
}

function deleteSubjectPlan(subjectId) {
    if (!state.studyPlan.subjects) return;
    const idx = state.studyPlan.subjects.findIndex(s => s.id === subjectId);
    if (idx === -1) return;
    
    const name = state.studyPlan.subjects[idx].name;
    if (confirm(`Remove plan for "${name}"?`)) {
        state.studyPlan.subjects.splice(idx, 1);
        saveDataToLocalStorage();
        renderPlannerView();
        renderDashboardView();
        showToast(`Subject plan for "${name}" deleted.`, "info");
    }
}

function populateSubjectFilter() {
    const filterEl = DOM.subjectFilter;
    if (!filterEl) return;
    const currentSel = filterEl.value;
    filterEl.innerHTML = '<option value="all">All Subjects</option>';
    const subjects = [...new Set(state.tasks.map(t => t.category.trim()))].filter(Boolean);
    subjects.sort().forEach(sub => {
        const opt = document.createElement("option");
        opt.value = sub.toLowerCase();
        opt.innerText = sub;
        filterEl.appendChild(opt);
    });
    filterEl.value = currentSel;
}

function awardPoints(pts) {
    if (!state.settings.rewardSystemEnabled) return;
    state.rewards.points += pts;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (state.rewards.lastActiveDate === yesterday) {
        state.rewards.streak++;
        state.rewards.lastActiveDate = today;
    } else if (state.rewards.lastActiveDate !== today) {
        state.rewards.streak = 1;
        state.rewards.lastActiveDate = today;
    }
    saveDataToLocalStorage();
    renderRewardsDisplays();
    updateLevelSystem();
    checkForBadgeUnlocks();
}

function renderRewardsDisplays() {
    if (DOM.rewardPointsDisplay) DOM.rewardPointsDisplay.innerText = state.rewards.points;
    if (DOM.rewardStreakDisplay) DOM.rewardStreakDisplay.innerText = `${state.rewards.streak} day${state.rewards.streak === 1 ? '' : 's'}`;
}

function updateLevelSystem() {
    const xp = state.rewards.points;
    let level = 1;
    let rank = "Beginner";
    if (xp >= 1000) {
        level = 5;
        rank = "Sage";
    } else if (xp >= 500) {
        level = 4;
        rank = "Elite Scholar";
    } else if (xp >= 200) {
        level = 3;
        rank = "Adept Learner";
    } else if (xp >= 50) {
        level = 2;
        rank = "Novice Planner";
    }
    if (DOM.rewardLevelDisplay) DOM.rewardLevelDisplay.innerText = `Level ${level}`;
    if (DOM.rewardRankDisplay) DOM.rewardRankDisplay.innerText = `${rank} Rank`;
    
    const topRank = document.getElementById("topProfileRank");
    if (topRank) topRank.innerText = `Level ${level}`;
}

function updateBadgesDisplay() {
    const badges = state.rewards.unlockedBadges;
    for (const key in badges) {
        const badgeEl = document.getElementById(`badge-${key}`);
        if (badgeEl) {
            if (badges[key]) {
                badgeEl.classList.remove("locked");
            } else {
                badgeEl.classList.add("locked");
            }
        }
    }
}

function checkForBadgeUnlocks() {
    const completedTasks = state.tasks.filter(t => t.completed).length;
    let newlyUnlocked = false;

    if (!state.rewards.unlockedBadges.first_task && completedTasks >= 1) {
        state.rewards.unlockedBadges.first_task = true;
        showToast("Achievement Unlocked: First Step! Unlocked on first completed task.", "success");
        newlyUnlocked = true;
    }
    if (!state.rewards.unlockedBadges.five_tasks && completedTasks >= 5) {
        state.rewards.unlockedBadges.five_tasks = true;
        showToast("Achievement Unlocked: Overachiever! Complete 5 study tasks.", "success");
        newlyUnlocked = true;
    }
    if (!state.rewards.unlockedBadges.timer_champ && state.rewards.pomodorosCompleted >= 1) {
        state.rewards.unlockedBadges.timer_champ = true;
        showToast("Achievement Unlocked: Focus Master! Complete your first Pomodoro session.", "success");
        newlyUnlocked = true;
    }
    if (!state.rewards.unlockedBadges.streak_3 && state.rewards.streak >= 3) {
        state.rewards.unlockedBadges.streak_3 = true;
        showToast("Achievement Unlocked: Streak Flame! Reach a 3-day study streak.", "success");
        newlyUnlocked = true;
    }

    if (newlyUnlocked) {
        saveDataToLocalStorage();
        updateBadgesDisplay();
        confettiBurst();
    }
}

function toggleTaskCompletion(id, isCompleted) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = isCompleted;
    if (isCompleted) {
        awardPoints(5);
        showToast("Task completed! +5 XP earned.", "success");
    }
    saveDataToLocalStorage();
    renderAllViews();
}

function openAddTaskModal() {
    if (!DOM.taskModal || !DOM.editTaskId || !DOM.taskForm || !DOM.modalTitle || !DOM.formSubmitBtn) return;
    DOM.editTaskId.value = "";
    DOM.taskForm.reset();
    DOM.modalTitle.innerHTML = '<i data-lucide="plus-circle"></i> Initialize Task Block';
    DOM.formSubmitBtn.innerHTML = '<i data-lucide="plus"></i> Save Task';
    DOM.taskModal.classList.add("active");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openEditTaskModal(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task || !DOM.taskModal) return;
    
    DOM.editTaskId.value = task.id;
    DOM.taskTitle.value = task.title;
    DOM.taskCategory.value = task.category;
    DOM.taskDate.value = task.date;
    DOM.taskPriority.value = task.priority;
    DOM.taskDuration.value = task.duration;
    DOM.taskNotes.value = task.notes || "";
    
    DOM.modalTitle.innerHTML = '<i data-lucide="edit"></i> Update Task Block';
    DOM.formSubmitBtn.innerHTML = '<i data-lucide="check"></i> Save Changes';
    DOM.taskModal.classList.add("active");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeTaskModal() {
    if (DOM.taskModal) {
        DOM.taskModal.classList.remove("active");
    }
}

function handleTaskFormSubmit(e) {
    e.preventDefault();
    const taskId = DOM.editTaskId.value;
    const titleVal = DOM.taskTitle.value.trim();
    const categoryVal = DOM.taskCategory.value.trim();
    const dateVal = DOM.taskDate.value;
    const priorityVal = DOM.taskPriority.value;
    const durationVal = parseInt(DOM.taskDuration.value, 10);
    const notesVal = DOM.taskNotes.value.trim();
    
    if (taskId) {
        const taskIdx = state.tasks.findIndex(t => t.id === parseInt(taskId, 10));
        if (taskIdx !== -1) {
            state.tasks[taskIdx] = {
                ...state.tasks[taskIdx],
                title: titleVal,
                category: categoryVal,
                date: dateVal,
                priority: priorityVal,
                duration: durationVal,
                notes: notesVal
            };
            showToast("Task updated.", "success");
        }
    } else {
        const newTask = {
            id: Date.now(),
            title: titleVal,
            category: categoryVal,
            date: dateVal,
            priority: priorityVal,
            duration: durationVal,
            notes: notesVal,
            completed: false
        };
        state.tasks.push(newTask);
        showToast("Task registered.", "success");
    }
    
    saveDataToLocalStorage();
    closeTaskModal();
    renderAllViews();
}

function duplicateTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    const dup = {
        ...task,
        id: Date.now(),
        title: `${task.title} (Copy)`,
        completed: false
    };
    state.tasks.push(dup);
    saveDataToLocalStorage();
    renderAllViews();
    showToast("Task duplicated.", "success");
}

function deleteTask(id) {
    const cardNode = document.querySelector(`.task-node[data-task-id="${id}"]`);
    if (cardNode) {
        cardNode.style.transition = "transform 0.2s, opacity 0.2s";
        cardNode.style.transform = "scale(0.95)";
        cardNode.style.opacity = "0";
    }
    setTimeout(() => {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveDataToLocalStorage();
        renderAllViews();
        showToast("Task removed.", "warning");
    }, 200);
}

function refreshTimerDisplays() {
    const mins = Math.floor(state.timer.stateSeconds / 60);
    const secs = state.timer.stateSeconds % 60;
    const padStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (DOM.mainTimerDisplay) DOM.mainTimerDisplay.innerText = padStr;
    if (DOM.dashTimerDisplay) DOM.dashTimerDisplay.innerText = padStr;
    if (DOM.sidebarTimerDisplay) DOM.sidebarTimerDisplay.innerText = padStr;
    if (DOM.focusTimerDisplay) DOM.focusTimerDisplay.innerText = padStr;
    if (DOM.spotlightTimerVal) DOM.spotlightTimerVal.innerText = padStr;
    
    // Update Document Title
    document.title = `${padStr} // FocusFlow`;
    
    if (DOM.mainTimerPhase) DOM.mainTimerPhase.innerText = state.timer.currentPhase;
    if (DOM.dashTimerPhase) DOM.dashTimerPhase.innerText = state.timer.currentPhase;
    if (DOM.focusTimerPhase) DOM.focusTimerPhase.innerText = state.timer.currentPhase;
    
    // Update SVG Progress Ring Gauges smoothly
    const ratio = state.timer.totalPhaseDuration > 0 ? (state.timer.stateSeconds / state.timer.totalPhaseDuration) : 0;
    const circumferenceMain = 565.48;
    const offsetMain = circumferenceMain * (1 - ratio);
    if (DOM.timerProgressCircle) DOM.timerProgressCircle.style.strokeDashoffset = offsetMain;
    
    const circumferenceFocus = 628.3;
    const offsetFocus = circumferenceFocus * (1 - ratio);
    if (DOM.focusProgressCircle) DOM.focusProgressCircle.style.strokeDashoffset = offsetFocus;
    
    // Toggle Living Active Pulse Halo
    if (DOM.timerContainer) {
        if (state.timer.isRunning) {
            DOM.timerContainer.classList.add("is-running");
        } else {
            DOM.timerContainer.classList.remove("is-running");
        }
    }
}

function toggleFocusTimerLoop() {
    if (state.timer.isRunning) {
        state.timer.isRunning = false;
        clearInterval(state.timer.countdownInterval);
        showToast("Focus session paused.", "info");
    } else {
        state.timer.isRunning = true;
        state.timer.countdownInterval = setInterval(tickFocusTimer, 1000);
        showToast("Focus session started.", "success");
    }
    updateTimerButtons();
    refreshTimerDisplays();
}

function resetFocusTimer() {
    state.timer.isRunning = false;
    clearInterval(state.timer.countdownInterval);
    state.timer.stateSeconds = state.timer.durationFocus * 60;
    state.timer.totalPhaseDuration = state.timer.stateSeconds;
    state.timer.currentPhase = "Focus";
    if (DOM.timerContainer) DOM.timerContainer.classList.remove("completed");
    refreshTimerDisplays();
    updateTimerButtons();
    showToast("Focus session reset.", "info");
}

function applyTimerPreset(minutes, phase) {
    state.timer.isRunning = false;
    clearInterval(state.timer.countdownInterval);
    state.timer.durationFocus = (phase === "Focus") ? minutes : state.timer.durationFocus;
    state.timer.stateSeconds = minutes * 60;
    state.timer.totalPhaseDuration = state.timer.stateSeconds;
    state.timer.currentPhase = phase;
    if (DOM.timerContainer) DOM.timerContainer.classList.remove("completed");
    
    DOM.timerPresets.forEach(btn => {
        if (btn.getAttribute("data-phase") === phase) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    
    refreshTimerDisplays();
    updateTimerButtons();
    showToast(`Preset: ${phase} (${minutes}m) loaded.`, "info");
}

function updateTimerButtons() {
    const playIconHTML = '<i data-lucide="play"></i> Start';
    const pauseIconHTML = '<i data-lucide="pause"></i> Pause';
    const mainPlayHTML = '<i data-lucide="play"></i> Start Session';
    const mainPauseHTML = '<i data-lucide="pause"></i> Pause Session';
    
    if (DOM.dashStartPauseBtn) {
        DOM.dashStartPauseBtn.innerHTML = state.timer.isRunning ? pauseIconHTML : playIconHTML;
        DOM.dashStartPauseBtn.className = state.timer.isRunning ? "btn btn-secondary" : "btn btn-primary";
    }
    if (DOM.mainStartPauseBtn) {
        DOM.mainStartPauseBtn.innerHTML = state.timer.isRunning ? mainPauseHTML : mainPlayHTML;
        DOM.mainStartPauseBtn.className = state.timer.isRunning ? "btn btn-secondary btn-lg" : "btn btn-primary btn-lg";
    }
    if (DOM.focusStartPauseBtn) {
        DOM.focusStartPauseBtn.innerHTML = state.timer.isRunning ? '<i data-lucide="pause"></i> Pause Focus' : '<i data-lucide="play"></i> Start Focus';
        DOM.focusStartPauseBtn.className = state.timer.isRunning ? "btn btn-secondary btn-lg" : "btn btn-primary btn-lg";
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function tickFocusTimer() {
    if (state.timer.stateSeconds > 0) {
        state.timer.stateSeconds--;
        refreshTimerDisplays();
        
        if (state.timer.currentPhase === "Focus") {
            const today = new Date().toISOString().split("T")[0];
            let current = 0;
            const stored = localStorage.getItem(`focusflow_study_time_${today}`);
            if (stored) current = parseInt(stored, 10);
            localStorage.setItem(`focusflow_study_time_${today}`, current + 1);
            
            if (current % 600 === 0 && current > 0) {
                awardPoints(1);
            }
        }
    } else {
        handleTimerExpiry();
    }
}

function handleTimerExpiry() {
    state.timer.isRunning = false;
    clearInterval(state.timer.countdownInterval);
    
    // Audio tone
    if (DOM.audioNotification) {
        DOM.audioNotification.play().catch(() => {});
    }
    
    // Add Celebratory State to Timer Ring
    if (DOM.timerContainer) {
        DOM.timerContainer.classList.add("completed");
        setTimeout(() => {
            if (DOM.timerContainer) DOM.timerContainer.classList.remove("completed");
        }, 4000);
    }
    
    if (state.timer.currentPhase === "Focus") {
        state.timer.pomodoroCount++;
        state.rewards.pomodorosCompleted++;
        awardPoints(15);
        showToast("Focus block complete! +15 XP rewarded.", "success");
        
        if (state.timer.pomodoroCount % 4 === 0) {
            state.timer.currentPhase = "Long Break";
            state.timer.stateSeconds = state.timer.durationLongBreak * 60;
        } else {
            state.timer.currentPhase = "Short Break";
            state.timer.stateSeconds = state.timer.durationBreak * 60;
        }
    } else {
        state.timer.currentPhase = "Focus";
        state.timer.stateSeconds = state.timer.durationFocus * 60;
        showToast("Break finished. Ready to focus?", "info");
    }
    
    state.timer.totalPhaseDuration = state.timer.stateSeconds;
    saveDataToLocalStorage();
    refreshTimerDisplays();
    updateTimerButtons();
    updatePomodoroDisplay();
    confettiBurst();
    
    if (state.timer.autoStart) {
        setTimeout(toggleFocusTimerLoop, 1000);
    }
}

function updatePomodoroDisplay() {
    const countEl = document.getElementById("pomodoroSessionText");
    if (countEl) {
        const active = (state.timer.pomodoroCount % 4) + 1;
        countEl.innerText = `Session ${active} of 4`;
    }
}

function enterFocusMode() {
    state.focusModeActive = true;
    let activeTaskTitle = "Deep Focus Block";
    if (state.activeTaskId) {
        const t = state.tasks.find(tk => tk.id === state.activeTaskId);
        if (t) activeTaskTitle = t.title;
    }
    if (DOM.focusActiveTaskTitle) DOM.focusActiveTaskTitle.innerText = activeTaskTitle;
    if (DOM.focusModeOverlay) DOM.focusModeOverlay.classList.add("active");
    
    if (!state.timer.isRunning) {
        toggleFocusTimerLoop();
    } else {
        refreshTimerDisplays();
        updateTimerButtons();
    }
}

function exitFocusMode() {
    state.focusModeActive = false;
    if (DOM.focusModeOverlay) DOM.focusModeOverlay.classList.remove("active");
}

function updateDefaultTimerDurations() {
    if (!DOM.settingFocusDuration || !DOM.settingBreakDuration || !DOM.settingLongBreakDuration) return;
    let focusVal = parseInt(DOM.settingFocusDuration.value, 10);
    let breakVal = parseInt(DOM.settingBreakDuration.value, 10);
    let longBreakVal = parseInt(DOM.settingLongBreakDuration.value, 10);
    
    if (isNaN(focusVal) || focusVal < 1) focusVal = 25;
    if (focusVal > 180) focusVal = 180;
    if (isNaN(breakVal) || breakVal < 1) breakVal = 5;
    if (breakVal > 60) breakVal = 60;
    if (isNaN(longBreakVal) || longBreakVal < 1) longBreakVal = 15;
    if (longBreakVal > 60) longBreakVal = 60;
    
    DOM.settingFocusDuration.value = focusVal;
    DOM.settingBreakDuration.value = breakVal;
    DOM.settingLongBreakDuration.value = longBreakVal;
    
    state.timer.durationFocus = focusVal;
    state.timer.durationBreak = breakVal;
    state.timer.durationLongBreak = longBreakVal;
    
    if (state.timer.currentPhase === "Focus") {
        state.timer.stateSeconds = focusVal * 60;
    } else if (state.timer.currentPhase === "Short Break") {
        state.timer.stateSeconds = breakVal * 60;
    } else if (state.timer.currentPhase === "Long Break") {
        state.timer.stateSeconds = longBreakVal * 60;
    }
    state.timer.totalPhaseDuration = state.timer.stateSeconds;
    
    saveDataToLocalStorage();
    syncPresetButtonsText();
    refreshTimerDisplays();
    showToast("System timer intervals updated.", "success");
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        showToast("Desktop notifications not supported.", "error");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            state.settings.notificationsEnabled = true;
            saveDataToLocalStorage();
            showToast("Desktop notifications granted.", "success");
        } else {
            showToast("Desktop notifications denied.", "warning");
        }
    });
}

function handleClearAllDataStores() {
    if (confirm("Reset the entire workspace database? All tasks and plans will be deleted. This cannot be undone.")) {
        localStorage.clear();
        state.tasks = [];
        state.settings = { theme: "dark", notificationsEnabled: false, rewardSystemEnabled: true, displayName: "" };
        state.timer = {
            durationFocus: 25,
            durationBreak: 5,
            durationLongBreak: 15,
            stateSeconds: 1500,
            totalPhaseDuration: 1500,
            isRunning: false,
            countdownInterval: null,
            currentPhase: "Focus",
            pomodoroCount: 0,
            autoStart: false
        };
        state.rewards = {
            points: 0,
            streak: 0,
            lastActiveDate: null,
            pomodorosCompleted: 0,
            unlockedBadges: { first_task: false, five_tasks: false, timer_champ: false, streak_3: false }
        };
        state.studyPlan = { subjects: [] };
        
        saveDataToLocalStorage();
        loadDataFromLocalStorage();
        switchView("dashboard");
        showToast("All data stores successfully cleared.", "warning");
    }
}

function exportDataToJSON() {
    const dataObj = {
        tasks: state.tasks,
        settings: state.settings,
        rewards: state.rewards,
        timer_config: {
            durationFocus: state.timer.durationFocus,
            durationBreak: state.timer.durationBreak,
            durationLongBreak: state.timer.durationLongBreak,
            autoStart: state.timer.autoStart
        },
        studyPlan: state.studyPlan
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `focusflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Workspace backup exported.", "success");
}

function triggerImportFileInput() {
    if (DOM.importFileInput) DOM.importFileInput.click();
}

function handleJSONDataImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const imported = JSON.parse(event.target.result);
            if (imported.tasks && Array.isArray(imported.tasks)) {
                imported.tasks.forEach(impTask => {
                    const exists = state.tasks.some(t => t.id === impTask.id);
                    if (!exists) {
                        state.tasks.push(impTask);
                    }
                });
            }
            if (imported.settings) {
                state.settings = { ...state.settings, ...imported.settings };
            }
            if (imported.rewards) {
                state.rewards = { ...state.rewards, ...imported.rewards };
            }
            if (imported.studyPlan) {
                state.studyPlan = { ...state.studyPlan, ...imported.studyPlan };
            }
            if (imported.timer_config) {
                state.timer.durationFocus = imported.timer_config.durationFocus || 25;
                state.timer.durationBreak = imported.timer_config.durationBreak || 5;
                state.timer.durationLongBreak = imported.timer_config.durationLongBreak || 15;
                state.timer.autoStart = imported.timer_config.autoStart || false;
            }
            saveDataToLocalStorage();
            loadDataFromLocalStorage();
            renderAllViews();
            showToast("Workspace database restored.", "success");
            confettiBurst();
        } catch (err) {
            showToast("Failed to parse backup JSON file.", "error");
        }
    };
    fileReader.readAsText(file);
    e.target.value = "";
}

function sanitizeData(rawString) {
    if (!rawString) return "";
    return rawString.toString().replace(/[&<>'"]/g, match => {
        const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return escapes[match] || match;
    });
}

function setupFormDateConstraints() {
    if (DOM.taskDate) DOM.taskDate.removeAttribute("min");
}

function toggleSidebar() {
    if (window.innerWidth > 768) {
        if (DOM.sidebar) DOM.sidebar.classList.toggle("collapsed");
        const workspace = document.querySelector(".workspace");
        if (workspace) workspace.classList.toggle("expanded");
    } else {
        toggleMobileSidebar();
    }
}

function registerEventListeners() {
    if (DOM.sidebarToggleBtn) {
        DOM.sidebarToggleBtn.addEventListener("click", toggleSidebar);
    }
    const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
    }
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeMobileSidebar);
    }
    
    document.addEventListener("click", (e) => {
        const target = e.target.closest("button, a, input[type='checkbox'], input[type='radio'], .metric-card, .badge-item");
        if (target) {
            playClickSound();
        }
    });

    const btnGridView = document.getElementById("btnGridView");
    const btnCalendarView = document.getElementById("btnCalendarView");
    if (btnGridView && btnCalendarView) {
        btnGridView.addEventListener("click", () => {
            state.calendar.viewMode = "grid";
            btnGridView.classList.add("active");
            btnCalendarView.classList.remove("active");
            renderTasksView();
        });
        btnCalendarView.addEventListener("click", () => {
            state.calendar.viewMode = "calendar";
            btnCalendarView.classList.add("active");
            btnGridView.classList.remove("active");
            renderTasksView();
        });
    }

    if (DOM.spotlightStartBtn) {
        DOM.spotlightStartBtn.addEventListener("click", enterFocusMode);
    }
    if (DOM.spotlightViewTasksBtn) {
        DOM.spotlightViewTasksBtn.addEventListener("click", () => switchView("tasks"));
    }

    if (DOM.openTaskModalBtn) DOM.openTaskModalBtn.addEventListener("click", openAddTaskModal);
    if (DOM.quickAddTaskBtn) DOM.quickAddTaskBtn.addEventListener("click", openAddTaskModal);
    if (DOM.closeModalBtn) DOM.closeModalBtn.addEventListener("click", closeTaskModal);
    if (DOM.cancelModalBtn) DOM.cancelModalBtn.addEventListener("click", closeTaskModal);
    if (DOM.taskForm) DOM.taskForm.addEventListener("submit", handleTaskFormSubmit);
    if (DOM.settingDisplayName) {
        DOM.settingDisplayName.addEventListener("input", (e) => {
            state.settings.displayName = e.target.value.trim();
            saveDataToLocalStorage();
            updateGreetingDisplay();
        });
    }
    if (DOM.taskSearch) {
        DOM.taskSearch.addEventListener("input", (e) => {
            state.filters.search = e.target.value.trim();
            renderTasksView();
        });
    }
    if (DOM.statusFilter) {
        DOM.statusFilter.addEventListener("change", (e) => {
            state.filters.status = e.target.value;
            renderTasksView();
        });
    }
    if (DOM.priorityFilter) {
        DOM.priorityFilter.addEventListener("change", (e) => {
            state.filters.priority = e.target.value;
            renderTasksView();
        });
    }
    if (DOM.subjectFilter) {
        DOM.subjectFilter.addEventListener("change", (e) => {
            state.filters.subject = e.target.value;
            renderTasksView();
        });
    }
    if (DOM.sortOrder) {
        DOM.sortOrder.addEventListener("change", (e) => {
            state.filters.sortOrder = e.target.value;
            renderTasksView();
        });
    }
    DOM.timerPresets.forEach(btn => {
        btn.addEventListener("click", () => {
            const minutes = parseInt(btn.getAttribute("data-duration"), 10);
            const phase = btn.getAttribute("data-phase");
            applyTimerPreset(minutes, phase);
        });
    });
    if (DOM.autoStartToggle) {
        DOM.autoStartToggle.addEventListener("change", (e) => {
            state.timer.autoStart = e.target.checked;
            if (DOM.settingAutoStartToggle) DOM.settingAutoStartToggle.checked = e.target.checked;
            saveDataToLocalStorage();
        });
    }
    if (DOM.settingAutoStartToggle) {
        DOM.settingAutoStartToggle.addEventListener("change", (e) => {
            state.timer.autoStart = e.target.checked;
            if (DOM.autoStartToggle) DOM.autoStartToggle.checked = e.target.checked;
            saveDataToLocalStorage();
        });
    }
    if (DOM.mainStartPauseBtn) DOM.mainStartPauseBtn.addEventListener("click", toggleFocusTimerLoop);
    if (DOM.dashStartPauseBtn) DOM.dashStartPauseBtn.addEventListener("click", toggleFocusTimerLoop);
    if (DOM.mainResetTimerBtn) DOM.mainResetTimerBtn.addEventListener("click", resetFocusTimer);
    if (DOM.studyPlanForm) DOM.studyPlanForm.addEventListener("submit", handleStudyPlanGeneration);
    if (DOM.enterFocusModeBtn) DOM.enterFocusModeBtn.addEventListener("click", enterFocusMode);
    if (DOM.exitFocusModeBtn) DOM.exitFocusModeBtn.addEventListener("click", exitFocusMode);
    if (DOM.focusStartPauseBtn) DOM.focusStartPauseBtn.addEventListener("click", toggleFocusTimerLoop);
    if (DOM.focusResetTimerBtn) DOM.focusResetTimerBtn.addEventListener("click", resetFocusTimer);
    if (DOM.themeToggleSwitch) {
        DOM.themeToggleSwitch.addEventListener("change", (e) => {
            toggleSystemTheme(e.target.checked);
        });
    }
    if (DOM.rewardSystemToggleSwitch) {
        DOM.rewardSystemToggleSwitch.addEventListener("change", (e) => {
            state.settings.rewardSystemEnabled = e.target.checked;
            if (DOM.rewardsDashboardPanel) {
                DOM.rewardsDashboardPanel.style.display = e.target.checked ? "flex" : "none";
            }
            saveDataToLocalStorage();
            showToast(`Reward Engine ${e.target.checked ? 'activated' : 'deactivated'}.`, "info");
        });
    }
    if (DOM.settingFocusDuration) DOM.settingFocusDuration.addEventListener("change", updateDefaultTimerDurations);
    if (DOM.settingBreakDuration) DOM.settingBreakDuration.addEventListener("change", updateDefaultTimerDurations);
    if (DOM.settingLongBreakDuration) DOM.settingLongBreakDuration.addEventListener("change", updateDefaultTimerDurations);
    if (DOM.grantPermissionBtn) DOM.grantPermissionBtn.addEventListener("click", requestNotificationPermission);
    if (DOM.clearAllTasksBtn) DOM.clearAllTasksBtn.addEventListener("click", handleClearAllDataStores);
    if (DOM.exportDataBtn) DOM.exportDataBtn.addEventListener("click", exportDataToJSON);
    if (DOM.importDataBtn) DOM.importDataBtn.addEventListener("click", triggerImportFileInput);
    if (DOM.importFileInput) DOM.importFileInput.addEventListener("change", handleJSONDataImport);

    const pendingCard = document.getElementById("metricPendingCard");
    if (pendingCard) pendingCard.addEventListener("click", () => switchView("tasks"));
    
    const completedCard = document.getElementById("metricCompletedCard");
    if (completedCard) completedCard.addEventListener("click", () => switchView("tasks"));
    
    const overdueCard = document.getElementById("metricOverdueCard");
    if (overdueCard) overdueCard.addEventListener("click", () => switchView("tasks"));
    
    const timeCard = document.getElementById("metricTimeCard");
    if (timeCard) timeCard.addEventListener("click", () => switchView("progress"));

    document.querySelectorAll(".badge-item").forEach(badge => {
        badge.addEventListener("click", () => {
            const nameEl = badge.querySelector(".badge-name");
            const name = nameEl ? nameEl.innerText : "Badge";
            const criteria = badge.getAttribute("title") || "Achievement details.";
            const isUnlocked = !badge.classList.contains("locked");
            showToast(`${name} Badge (${isUnlocked ? "Unlocked" : "Locked"}): ${criteria}`, "info");
        });
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        const isEditing = document.activeElement.tagName === "INPUT" || 
                          document.activeElement.tagName === "TEXTAREA" || 
                          document.activeElement.tagName === "SELECT";
        if (e.key === "Escape") {
            if (DOM.taskModal && DOM.taskModal.classList.contains("active")) {
                closeTaskModal();
            } else if (state.focusModeActive) {
                exitFocusMode();
            }
        }
        if (isEditing) return;
        if (e.key === " " || e.code === "Space") {
            e.preventDefault();
            toggleFocusTimerLoop();
        }
        if (e.key === "n" || e.key === "N") {
            e.preventDefault();
            openAddTaskModal();
        }
        
        if (e.ctrlKey || e.metaKey) {
            if (e.key === "/") {
                e.preventDefault();
                if (DOM.themeToggleSwitch) {
                    DOM.themeToggleSwitch.checked = !DOM.themeToggleSwitch.checked;
                    toggleSystemTheme(DOM.themeToggleSwitch.checked);
                }
            } else if (e.key === "d" || e.key === "D") {
                e.preventDefault();
                switchView("dashboard");
            } else if (e.key === "p" || e.key === "P") {
                e.preventDefault();
                switchView("planner");
            } else if (e.key === "t" || e.key === "T") {
                e.preventDefault();
                switchView("tasks");
            } else if (e.key === "g" || e.key === "G") {
                e.preventDefault();
                switchView("progress");
            } else if (e.key === "s" || e.key === "S") {
                e.preventDefault();
                switchView("settings");
            }
        }
    });
}

function playClickSound() {
    try {
        if (!audioCtxShared) {
            audioCtxShared = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxShared.state === "suspended") {
            audioCtxShared.resume();
        }
        const osc = audioCtxShared.createOscillator();
        const gainNode = audioCtxShared.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, audioCtxShared.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtxShared.currentTime + 0.04);
        gainNode.gain.setValueAtTime(0.008, audioCtxShared.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtxShared.currentTime + 0.04);
        osc.connect(gainNode);
        gainNode.connect(audioCtxShared.destination);
        osc.start();
        osc.stop(audioCtxShared.currentTime + 0.05);
    } catch (e) {
        console.warn("Click sound failed: ", e);
    }
}

function checkForNearDeadlines() {
    const now = Date.now();
    const alertWindow = 3600000;
    state.tasks.forEach(task => {
        if (task.completed || !task.date) return;
        const diff = new Date(task.date).getTime() - now;
        if (diff > 0 && diff < alertWindow) {
            const key = `alert_notified_${task.id}`;
            if (!localStorage.getItem(key)) {
                showToast(`Upcoming Deadline: "${task.title}" is due soon!`, "warning", 4000);
                localStorage.setItem(key, "true");
            }
        }
    });
}

function checkForNearDeadlinesTimer() {
    checkForNearDeadlines();
    setTimeout(checkForNearDeadlinesTimer, 60000);
}
setTimeout(checkForNearDeadlinesTimer, 10000);

let toastQueue = [];
let toastActive = false;

function showToast(title, type = "info", duration = 2400) {
    toastQueue.push({ title, type, duration });
    processToastQueue();
}

function processToastQueue() {
    if (toastActive || toastQueue.length === 0) return;
    toastActive = true;
    
    const { title, type, duration } = toastQueue.shift();
    const container = document.getElementById("toastContainer");
    if (!container) {
        toastActive = false;
        return;
    }
    
    let mainTitle = title;
    let description = "";
    const splitIndex = title.indexOf(": ");
    if (splitIndex !== -1) {
        mainTitle = title.substring(0, splitIndex);
        description = title.substring(splitIndex + 2);
    } else {
        const dotIndex = title.indexOf(". ");
        if (dotIndex !== -1) {
            mainTitle = title.substring(0, dotIndex + 1);
            description = title.substring(dotIndex + 2);
        }
    }
    
    const toast = document.createElement("div");
    toast.className = "toast-card";
    
    let iconName = "info";
    if (type === "success") iconName = "check-circle-2";
    else if (type === "error") iconName = "alert-circle";
    else if (type === "warning") iconName = "alert-triangle";
    
    toast.innerHTML = `
        <div class="toast-icon ${type}"><i data-lucide="${iconName}"></i></div>
        <div class="toast-content">
            <span class="toast-title">${sanitizeData(mainTitle)}</span>
            ${description ? `<span class="toast-message">${sanitizeData(description)}</span>` : ""}
        </div>
    `;
    
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.add("dismiss");
        setTimeout(() => {
            toast.remove();
            toastActive = false;
            processToastQueue();
        }, 200);
    }, duration);
}

function confettiBurst() {
    if (typeof confetti === "function") {
        confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.7 }
        });
    }
}

function toggleMobileSidebar() {
    if (!DOM.sidebar) return;
    const overlay = document.getElementById("sidebarOverlay");
    const isVisible = DOM.sidebar.classList.contains("mobile-active");
    if (isVisible) {
        closeMobileSidebar();
    } else {
        DOM.sidebar.classList.add("mobile-active");
        if (overlay) overlay.classList.add("active");
    }
}

function closeMobileSidebar() {
    if (DOM.sidebar) DOM.sidebar.classList.remove("mobile-active");
    const overlay = document.getElementById("sidebarOverlay");
    if (overlay) overlay.classList.remove("active");
}

function checkWelcomeOnboarding() {
    const hasVisited = localStorage.getItem("focusflow_onboarded");
    if (hasVisited) return;
    const welcomeModal = document.getElementById("welcomeModal");
    const welcomeForm = document.getElementById("welcomeForm");
    if (!welcomeModal || !welcomeForm) return;
    setTimeout(() => {
        welcomeModal.classList.add("active");
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 1800);
    welcomeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("welcomeNameInput");
        const name = nameInput ? nameInput.value.trim() : "";
        if (!name) return;
        state.settings.displayName = name;
        saveDataToLocalStorage();
        updateGreetingDisplay();
        if (DOM.settingDisplayName) DOM.settingDisplayName.value = name;
        welcomeModal.classList.remove("active");
        localStorage.setItem("focusflow_onboarded", "true");
        showToast(`Welcome, ${name}! Your focus environment is ready.`, "success");
        confettiBurst();
    });
}

function renderTasksCalendar() {
    const calendarContainer = document.getElementById("tasksCalendar");
    if (!calendarContainer) return;
    
    calendarContainer.innerHTML = "";
    
    const curDate = state.calendar.currentDate;
    const year = curDate.getFullYear();
    const month = curDate.getMonth();
    
    const header = document.createElement("div");
    header.className = "calendar-header";
    
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const title = document.createElement("h3");
    title.className = "calendar-title";
    title.innerText = `${monthNames[month]} ${year}`;
    
    const nav = document.createElement("div");
    nav.className = "calendar-nav";
    
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-secondary btn-sm";
    prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
    prevBtn.type = "button";
    prevBtn.addEventListener("click", () => {
        state.calendar.currentDate.setMonth(month - 1);
        renderTasksCalendar();
    });
    
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-secondary btn-sm";
    nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
    nextBtn.type = "button";
    nextBtn.addEventListener("click", () => {
        state.calendar.currentDate.setMonth(month + 1);
        renderTasksCalendar();
    });
    
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    header.appendChild(title);
    header.appendChild(nav);
    calendarContainer.appendChild(header);
    
    const grid = document.createElement("div");
    grid.className = "calendar-grid";
    
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-day-header";
        dayHeader.innerText = day;
        grid.appendChild(dayHeader);
    });
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayNum = prevTotalDays - i;
        const cell = createDayCell(year, month - 1, dayNum, true);
        grid.appendChild(cell);
    }
    
    const today = new Date();
    for (let i = 1; i <= totalDays; i++) {
        const isToday = (today.getDate() === i && today.getMonth() === month && today.getFullYear() === year);
        const cell = createDayCell(year, month, i, false, isToday);
        grid.appendChild(cell);
    }
    
    const currentGridCount = firstDayIndex + totalDays;
    const remainingDays = 42 - currentGridCount;
    for (let i = 1; i <= remainingDays; i++) {
        const cell = createDayCell(year, month + 1, i, true);
        grid.appendChild(cell);
    }
    
    calendarContainer.appendChild(grid);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function createDayCell(year, month, dayNum, isOtherMonth = false, isToday = false) {
    const cell = document.createElement("div");
    cell.className = `calendar-day-cell${isOtherMonth ? ' other-month' : ''}${isToday ? ' today' : ''}`;
    
    const dayLabel = document.createElement("div");
    dayLabel.className = "calendar-day-number";
    dayLabel.innerText = dayNum;
    cell.appendChild(dayLabel);
    
    const tasksContainer = document.createElement("div");
    tasksContainer.className = "calendar-day-tasks";
    
    const targetMonth = month + 1;
    const dateStr = `${year}-${targetMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    
    const dayTasks = state.tasks.filter(task => {
        if (!task.date) return false;
        return task.date.startsWith(dateStr);
    });
    
    dayTasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = `calendar-task-item${task.completed ? ' completed' : ''}`;
        taskItem.innerText = task.title;
        taskItem.title = `${task.title} (${task.category})`;
        taskItem.addEventListener("click", (e) => {
            e.stopPropagation();
            openEditTaskModal(task.id);
        });
        tasksContainer.appendChild(taskItem);
    });
    
    cell.appendChild(tasksContainer);
    
    cell.addEventListener("dblclick", () => {
        openAddTaskModal();
        const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}T09:00`;
        if (DOM.taskDate) DOM.taskDate.value = formattedDate;
    });
    
    return cell;
}
