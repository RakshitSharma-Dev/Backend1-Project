(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

const bookingSection = document.querySelector('.booking-section');

if (bookingSection) {
    const nightPrice = Number(bookingSection.dataset.nightPrice || 0);
    const checkInInput = bookingSection.querySelector('#checkIn');
    const checkOutInput = bookingSection.querySelector('#checkOut');
    const guestsInput = bookingSection.querySelector('#guests');
    const totalPriceInput = bookingSection.querySelector('#totalPrice');
    const bookingTotal = bookingSection.querySelector('#bookingTotal');

    if (!checkInInput || !checkOutInput || !guestsInput || !totalPriceInput || !bookingTotal) {
        // Required elements not present inside booking section — do nothing safely
    } else {
        const updateTotal = () => {
            const checkInDate = new Date(checkInInput.value);
            const checkOutDate = new Date(checkOutInput.value);

            if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
                bookingTotal.textContent = '0';
                totalPriceInput.value = '0';
                return;
            }

            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            const guests = Math.max(1, Number(guestsInput.value || 1));
            const total = nights * nightPrice * guests;

            bookingTotal.textContent = total.toLocaleString('en-IN');
            totalPriceInput.value = String(total);
        };

        checkInInput.addEventListener('change', updateTotal);
        checkOutInput.addEventListener('change', updateTotal);
        guestsInput.addEventListener('input', updateTotal);
        updateTotal();
    }
}