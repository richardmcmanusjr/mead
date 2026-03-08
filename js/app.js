// ============================================================================
// MEAD - Fueling Strategy Planner
// A self-contained web application for managing athletic fueling
// ============================================================================

// Data Manager - handles localStorage persistence
const DataManager = {
    saveAthleteProfile(profile) {
        localStorage.setItem('athleteProfile', JSON.stringify(profile));
    },

    getAthleteProfile() {
        const stored = localStorage.getItem('athleteProfile');
        return stored ? JSON.parse(stored) : this.getDefaultProfile();
    },

    getDefaultProfile() {
        return {
            weight_kg: 75,
            goal: 'performance',
            gi_tolerance: 'medium'
        };
    },

    saveWorkouts(workouts) {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    },

    getWorkouts() {
        const stored = localStorage.getItem('workouts');
        return stored ? JSON.parse(stored) : { sessions: [] };
    },

    clearAll() {
        localStorage.removeItem('athleteProfile');
        localStorage.removeItem('workouts');
    },

    exportData() {
        const data = {
            athlete: this.getAthleteProfile(),
            workouts: this.getWorkouts(),
            exportedAt: new Date().toISOString()
        };
        return data;
    },

    importData(data) {
        if (data.athlete) this.saveAthleteProfile(data.athlete);
        if (data.workouts) this.saveWorkouts(data.workouts);
    }
};

// Fueling Engine - calculates carb requirements
const FuelingEngine = {
    carbsForSession(weight, duration, intensity) {
        const intensityMultipliers = {
            'high': 1.0,
            'medium': 0.7,
            'low': 0.5
        };
        const multiplier = intensityMultipliers[intensity] || 0.5;
        return multiplier * weight * (duration / 60);
    },

    preWorkoutCarbs(duration, intensity) {
        const ranges = {
            'high': '60-90g carbs',
            'medium': '40-60g carbs',
            'low': '20-40g carbs'
        };
        return ranges[intensity] || '20-40g carbs';
    },

    generatePlan(athlete, workouts) {
        const plans = [];
        const weight = athlete.weight_kg;

        for (const session of workouts.sessions) {
            const [hours, minutes] = session.time.split(':');
            const sessionTime = new Date();
            sessionTime.setHours(parseInt(hours), parseInt(minutes), 0);

            // Calculate pre-workout time (3 hours before)
            const preTime = new Date(sessionTime.getTime() - 3 * 60 * 60 * 1000);

            const carbsNeeded = this.carbsForSession(
                weight,
                session.duration_min,
                session.intensity
            );

            plans.push({
                session: session.type,
                time: session.time,
                pre_time: `${String(preTime.getHours()).padStart(2, '0')}:${String(preTime.getMinutes()).padStart(2, '0')}`,
                pre_fuel: this.preWorkoutCarbs(session.duration_min, session.intensity),
                during: `${Math.round(carbsNeeded)}g carbs total`,
                during_rate: `${Math.round(carbsNeeded / (session.duration_min / 60))}g/hr`
            });
        }

        return plans;
    }
};

// UI Controller - handles DOM updates
const UI = {
    loadAthleteProfile() {
        const profile = DataManager.getAthleteProfile();
        document.getElementById('weight').value = profile.weight_kg;
        document.getElementById('goal').value = profile.goal;
        document.getElementById('gi').value = profile.gi_tolerance;
    },

    renderWorkouts() {
        const workouts = DataManager.getWorkouts();
        const container = document.getElementById('workoutsList');

        if (workouts.sessions.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No workouts added yet</p></div>';
            return;
        }

        container.innerHTML = workouts.sessions.map((session, index) => `
            <div class="workout-item">
                <div class="workout-details">
                    <h4>${this.formatSessionType(session.type)}</h4>
                    <p><strong>Time:</strong> ${session.time}</p>
                    <p><strong>Duration:</strong> ${session.duration_min} minutes</p>
                    <p><strong>Intensity:</strong> ${this.capitalize(session.intensity)}</p>
                </div>
                <button class="workout-delete" onclick="deleteWorkout(${index})">Delete</button>
            </div>
        `).join('');
    },

    renderFuelingPlan(plans) {
        const container = document.getElementById('fuelingPlan');

        if (plans.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Generate a plan to see recommendations</p></div>';
            return;
        }

        container.innerHTML = plans.map(plan => `
            <div class="plan-item">
                <h4>🏃 ${this.formatSessionType(plan.session)}</h4>
                <div class="plan-detail">
                    <strong>Workout Time:</strong>
                    <span>${plan.time}</span>
                </div>
                <div class="plan-detail">
                    <strong>Pre-Workout Meal:</strong>
                    <span>${plan.pre_time} - ${plan.pre_fuel}</span>
                </div>
                <div class="plan-detail">
                    <strong>During Workout:</strong>
                    <span>${plan.during}</span>
                </div>
                <div class="plan-detail">
                    <strong>Rate:</strong>
                    <span>${plan.during_rate}</span>
                </div>
            </div>
        `).join('');
    },

    formatSessionType(type) {
        return type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    showMessage(message, type = 'success') {
        // Simple alert-based notification
        // In production, you might use a toast library
        const emoji = type === 'success' ? '✅' : '❌';
        console.log(`${emoji} ${message}`);
    }
};

// ============================================================================
// Global Functions - called from HTML
// ============================================================================

function saveAthleteProfile() {
    const profile = {
        weight_kg: parseFloat(document.getElementById('weight').value) || 75,
        goal: document.getElementById('goal').value,
        gi_tolerance: document.getElementById('gi').value
    };

    if (profile.weight_kg <= 0) {
        UI.showMessage('Please enter a valid weight', 'error');
        return;
    }

    DataManager.saveAthleteProfile(profile);
    UI.showMessage('✅ Athlete profile saved!');
    generatePlan();
}

function showAddWorkoutForm() {
    document.getElementById('addWorkoutForm').style.display = 'block';
}

function hideAddWorkoutForm() {
    document.getElementById('addWorkoutForm').style.display = 'none';
}

function addWorkout() {
    const type = document.getElementById('sessionType').value.trim();
    const time = document.getElementById('sessionTime').value;
    const duration = parseInt(document.getElementById('sessionDuration').value);
    const intensity = document.getElementById('sessionIntensity').value;

    if (!type || !time || !duration || duration <= 0) {
        UI.showMessage('❌ Please fill in all fields with valid values', 'error');
        return;
    }

    const workouts = DataManager.getWorkouts();
    workouts.sessions.push({
        type,
        time,
        duration_min: duration,
        intensity
    });

    DataManager.saveWorkouts(workouts);

    // Clear form
    document.getElementById('sessionType').value = '';
    document.getElementById('sessionTime').value = '';
    document.getElementById('sessionDuration').value = '';
    document.getElementById('sessionIntensity').value = 'low';

    hideAddWorkoutForm();
    UI.renderWorkouts();
    UI.showMessage('✅ Workout added!');
    generatePlan();
}

function deleteWorkout(index) {
    if (!confirm('Delete this workout?')) return;

    const workouts = DataManager.getWorkouts();
    workouts.sessions.splice(index, 1);
    DataManager.saveWorkouts(workouts);

    UI.renderWorkouts();
    UI.showMessage('✅ Workout deleted!');
    generatePlan();
}

function generatePlan() {
    const athlete = DataManager.getAthleteProfile();
    const workouts = DataManager.getWorkouts();
    const plan = FuelingEngine.generatePlan(athlete, workouts);
    UI.renderFuelingPlan(plan);
}

function exportData() {
    const data = DataManager.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mead-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    UI.showMessage('✅ Data exported!');
}

function importData() {
    const fileInput = document.getElementById('importFile');
    fileInput.click();

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                DataManager.importData(data);
                UI.loadAthleteProfile();
                UI.renderWorkouts();
                generatePlan();
                UI.showMessage('✅ Data imported successfully!');
            } catch (error) {
                UI.showMessage('❌ Error importing data. Check file format.', 'error');
            }
        };
        reader.readAsText(file);
    }, { once: true });
}

function clearAllData() {
    if (!confirm('Are you sure? This will delete all your data.')) return;

    DataManager.clearAll();
    UI.loadAthleteProfile();
    UI.renderWorkouts();
    UI.renderFuelingPlan([]);
    UI.showMessage('✅ All data cleared!');
}

// ============================================================================
// Initialize on page load
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    UI.loadAthleteProfile();
    UI.renderWorkouts();
    generatePlan();
});
