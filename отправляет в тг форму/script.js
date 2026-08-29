/**
 * Скрипт интерактивности, обработки модальных окон и прямой отправки форм в Telegram
 * ПК ММ Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // НАСТРОЙКИ TELEGRAM API
    // -------------------------------------------------------------
    const TELEGRAM_BOT_TOKEN = '7922175837:AAGX03lkddG2pTlumjrD9xxDSGbg7UgAJGY';
    const TELEGRAM_CHAT_ID = '-1004451902021';

    // -------------------------------------------------------------
    // 1. УВЕДОМЛЕНИЯ В СТИЛЕ САЙТА (ВМЕСТО ALERT)
    // -------------------------------------------------------------
    function showNotification(message, type = 'success') {
        let notify = document.getElementById('siteNotification');
        
        if (!notify) {
            notify = document.createElement('div');
            notify.id = 'siteNotification';
            notify.className = 'site-notification';
            document.body.appendChild(notify);
        }

        notify.textContent = message;
        notify.className = `site-notification site-notification--${type} is-visible`;

        setTimeout(() => {
            notify.classList.remove('is-visible');
        }, 4000);
    }

    // -------------------------------------------------------------
    // 2. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ (INTERSECTION OBSERVER)
    // -------------------------------------------------------------
    const fadeElements = document.querySelectorAll('.js-fade');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const appearanceObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(element => appearanceObserver.observe(element));
    } else {
        fadeElements.forEach(element => element.classList.add('is-visible'));
    }

    // -------------------------------------------------------------
    // 3. УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ (БУРГЕР)
    // -------------------------------------------------------------
    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');

    if (burgerBtn && mainNav) {
        burgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('is-open');
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('is-open');
            });
        });
    }

    // -------------------------------------------------------------
    // 4. УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ (POPUPS)
    // -------------------------------------------------------------
    const orderPopup = document.getElementById('orderPopup');
    const privacyPopup = document.getElementById('privacyPopup');
    const termsPopup = document.getElementById('termsPopup');
    const docPopup = document.getElementById('docPopup');
    
    const openOrderBtns = document.querySelectorAll('.js-open-order');
    const openPrivacyBtns = document.querySelectorAll('.js-open-privacy');
    const openTermsBtns = document.querySelectorAll('.js-open-terms');
    const openDocBtns = document.querySelectorAll('.js-open-doc');
    const closeBtns = document.querySelectorAll('[data-close]');

    function openModal(modal) {
        if (!modal) return;
        document.body.style.overflow = 'hidden';
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal(modal) {
        if (!modal) return;
        document.body.style.overflow = '';
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }

    // Открытие формы заказа
    openOrderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productName = btn.getAttribute('data-product');
            const productInput = document.getElementById('modalProduct');
            
            if (productName && productInput) {
                productInput.value = productName;
            }
            openModal(orderPopup);
        });
    });

    // Открытие просмотра документов/сертификатов
    openDocBtns.forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.getAttribute('data-img');
            const docTitle = card.getAttribute('data-title');
            
            const docPopupImg = document.getElementById('docPopupImg');
            const docPopupTitle = document.getElementById('docPopupTitle');
            
            if (docPopupImg && imgSrc) {
                docPopupImg.src = imgSrc;
            }
            if (docPopupTitle && docTitle) {
                docPopupTitle.textContent = docTitle;
            }
            
            openModal(docPopup);
        });
    });

    // Открытие соглашений
    openPrivacyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(orderPopup);
            openModal(privacyPopup);
        });
    });

    openTermsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(termsPopup);
        });
    });

    // Закрытие по крестику или кнопке
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const popup = btn.closest('.popup');
            closeModal(popup);
        });
    });

    // Закрытие по клику на подложку (оверлей)
    document.querySelectorAll('.popup').forEach(popup => {
        popup.addEventListener('click', (e) => {
            if (e.target === popup || e.target.classList.contains('popup__overlay')) {
                closeModal(popup);
            }
        });
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.popup.is-open').forEach(popup => closeModal(popup));
        }
    });

    // -------------------------------------------------------------
    // 5. ОТПРАВКА ДАННЫХ В TELEGRAM ИЗ ВСЕХ ФОРМ
    // -------------------------------------------------------------
    async function sendToTelegram(text) {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const resData = await response.json();

        if (!response.ok || !resData.ok) {
            throw new Error(resData.description || 'Ошибка отправки в Telegram');
        }
        return resData;
    }

    const allForms = document.querySelectorAll('form');

    allForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : '';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Отправка...';
            }

            let message = `<b>🚀 Новая заявка с сайта PKMM!</b>\n\n`;

            // Формируем заголовок формы
            const formTitle = form.querySelector('.form__title, .popup__title');
            if (formTitle) {
                message += `<b>Форма:</b> ${formTitle.textContent.trim()}\n\n`;
            }

            // Перебираем поля формы
            const formInputs = form.querySelectorAll('input, select, textarea');
            
            formInputs.forEach(input => {
                if (input.type === 'submit' || input.type === 'button') return;

                let fieldLabel = input.name || input.id;
                const labelElement = form.querySelector(`label[for="${input.id}"]`);
                
                if (labelElement) {
                    fieldLabel = labelElement.textContent.replace('*', '').trim();
                } else if (input.placeholder) {
                    fieldLabel = input.placeholder;
                }

                // В случае выпадающего списка выбираем текст опции
                let val = input.value.trim();
                if (input.tagName.toLowerCase() === 'select') {
                    val = input.options[input.selectedIndex].text;
                }

                if (val !== '') {
                    message += `<b>${fieldLabel}:</b> ${val}\n`;
                }
            });

            try {
                await sendToTelegram(message);
                showNotification('Спасибо! Ваша заявка успешно отправлена.', 'success');
                form.reset();

                const parentPopup = form.closest('.popup');
                if (parentPopup) {
                    closeModal(parentPopup);
                }
            } catch (error) {
                console.error('Ошибка отправки:', error);
                showNotification('Не удалось отправить заявку. Проверьте соединение с сетью.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    });

    // -------------------------------------------------------------
    // 6. МАСКА ВВОДА ТЕЛЕФОНА
    // -------------------------------------------------------------
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
            if (!x[2]) {
                e.target.value = x[1] ? '+' + x[1] : '';
            } else {
                e.target.value = '+' + x[1] + ' (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
            }
        });
    });
});