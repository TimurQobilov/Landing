/**
 * Скрипт интерактивности, обработки модальных окон и отправки форм НА ПОЧТУ (через EmailJS)
 * ПК ММ Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // НАСТРОЙКИ EMAILJS (Вставьте свои данные с сайта EmailJS)
    // -------------------------------------------------------------
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';    // Ваш Public Key
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';    // Ваш Service ID
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // Ваш Template ID

    // Инициализация EmailJS
    if (window.emailjs) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // -------------------------------------------------------------
    // 1. УВЕДОМЛЕНИЯ В СТИЛЕ САЙТА
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
    // 2. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ
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

    // Просмотр документов
    openDocBtns.forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.getAttribute('data-img');
            const docTitle = card.getAttribute('data-title');
            
            const docPopupImg = document.getElementById('docPopupImg');
            const docPopupTitle = document.getElementById('docPopupTitle');
            
            if (docPopupImg && imgSrc) docPopupImg.src = imgSrc;
            if (docPopupTitle && docTitle) docPopupTitle.textContent = docTitle;
            
            openModal(docPopup);
        });
    });

    // Соглашения
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

    // Закрытия окон
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.closest('.popup')));
    });

    document.querySelectorAll('.popup').forEach(popup => {
        popup.addEventListener('click', (e) => {
            if (e.target === popup || e.target.classList.contains('popup__overlay')) {
                closeModal(popup);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.popup.is-open').forEach(popup => closeModal(popup));
        }
    });

    // -------------------------------------------------------------
    // 5. ОТПРАВКА ФОРМ НА ПОЧТУ
    // -------------------------------------------------------------
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

            // Формируем объект с данными формы
            const formData = new FormData(form);
            const templateParams = {};

            // Заполняем данные для шаблона EmailJS
            formData.forEach((value, key) => {
                templateParams[key] = value;
            });

            // Название формы
            const formTitle = form.querySelector('.form__title, .popup__title');
            templateParams['form_name'] = formTitle ? formTitle.textContent.trim() : 'Заявка с сайта';

            try {
                // Отправка через EmailJS
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
                
                showNotification('Спасибо! Заявка успешно отправлена на почту.', 'success');
                form.reset();

                const parentPopup = form.closest('.popup');
                if (parentPopup) {
                    closeModal(parentPopup);
                }
            } catch (error) {
                console.error('Ошибка отправки письма:', error);
                showNotification('Ошибка отправки. Попробуйте позже.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    });

    // -------------------------------------------------------------
    // 6. МАСКА ТЕЛЕФОНА
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