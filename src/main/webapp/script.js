
(function () {
    const start = document.getElementById('start');
    const end = document.getElementById('end');
    const picker = document.getElementById('picker');
    const range = document.getElementById('range');
    const labels = document.querySelectorAll('.dl');

    if (!start || !end || !picker || !range) return;

    // Set today's date as the earliest start date
    const today = new Date();
    today.setMinutes(
        today.getMinutes() - today.getTimezoneOffset()
    );
    start.min = today.toISOString().split('T')[0];

    function formatDate(date, withYear = false) {
        const options = {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        };

        if (withYear) options.year = 'numeric';

        return date.toLocaleDateString('en-GB', options);
    }

    function updateDates() {
        if (!start.value) return;

        end.min = start.value;

        if (end.value && end.value < start.value) {
            end.value = start.value;
        }

        const first = new Date(start.value + 'T00:00:00');

        labels.forEach(function (label, index) {
            const date = new Date(first);
            date.setDate(first.getDate() + index);

            label.textContent =
                'Day ' + (index + 1) + ' – ' + formatDate(date);
        });

        if (end.value) {
            const last = new Date(end.value + 'T00:00:00');

            range.textContent =
                'Your trip: ' + formatDate(first) +
                ' to ' + formatDate(last, true);
        } else {
            range.textContent = 'Please select your end date.';
        }

        try {
            localStorage.setItem('tokyoStart', start.value);
        } catch (error) {}
    }

    picker.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!start.value || !end.value) return;

        updateDates();

        document.getElementById('itinerary')
            .scrollIntoView({ behavior: 'smooth' });
    });

    start.addEventListener('change', updateDates);
    end.addEventListener('change', updateDates);

    try {
        const saved = localStorage.getItem('tokyoStart');

        if (saved && saved >= start.min) {
            start.value = saved;
        }
    } catch (error) {}

    updateDates();
})();
