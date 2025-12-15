// Глобальные переменные для калькулятора
let calculatorModal = null;
let calculatorForm = null;
let totalPrice = null;

// Функция расчета для калькулятора (оставляем только локальную)
function calculatePrice() {
    try {
        const roomType = document.getElementById('room-type')?.value || 'office';
        const area = parseFloat(document.getElementById('area')?.value) || 0;
        const sockets = parseInt(document.getElementById('sockets')?.value) || 0;
        const lights = parseInt(document.getElementById('lights')?.value) || 0;
        
        // Цены за квадратный метр
        const prices = { 
            'office': 250, 
            'warehouse': 450, 
            'manufacturing': 850 
        };
        
        const roomPrice = prices[roomType] || 250;
        const total = (area * roomPrice) + (sockets * 450) + (lights * 650);
        
        if (totalPrice) {
            totalPrice.textContent = total.toLocaleString('ru-RU') + ' ₽';
        }
        return total;
    } catch (error) {
        console.error('Ошибка расчета:', error);
        if (totalPrice) {
            totalPrice.textContent = '0 ₽';
        }
        return 0;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // ===== ИНИЦИАЛИЗАЦИЯ ЭЛЕМЕНТОВ КАЛЬКУЛЯТОРА =====
    calculatorModal = document.getElementById('calculator-modal');
    calculatorForm = document.getElementById('calculator-form');
    totalPrice = document.getElementById('total-price');
    
    // ===== МОБИЛЬНОЕ МЕНЮ =====
    try {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                const isOpen = mobileMenu.classList.contains('show');
                mobileMenu.classList.toggle('show');
                
                const icon = this.querySelector('i');
                if (isOpen) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            });
            
            // Закрытие меню при клике на ссылку
            if (mobileMenu) {
                mobileMenu.querySelectorAll('.nav-link').forEach(link => {
                    link.addEventListener('click', () => {
                        mobileMenu.classList.remove('show');
                        const icon = mobileMenuBtn.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    });
                });
            }
            
            // Закрытие меню при клике вне его
            document.addEventListener('click', function(e) {
                if (mobileMenu && mobileMenu.classList.contains('show') && 
                    !mobileMenu.contains(e.target) && 
                    !mobileMenuBtn.contains(e.target)) {
                    mobileMenu.classList.remove('show');
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации мобильного меню:', error);
    }

    // ===== АНИМАЦИЯ СЧЕТЧИКОВ =====
    try {
        const counters = document.querySelectorAll('.counter');
        
        if (counters.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = entry.target;
                        const target = parseInt(counter.getAttribute('data-target')) || 0;
                        const currentValue = parseInt(counter.textContent.replace(/\D/g, '')) || 0;
                        
                        // Если счетчик уже имеет значение, не анимируем
                        if (currentValue > 0 && currentValue !== target) {
                            let start = currentValue;
                            const duration = 2000;
                            const increment = (target - start) / (duration / 16);
                            
                            const timer = setInterval(() => {
                                start += increment;
                                if ((increment > 0 && start >= target) || (increment < 0 && start <= target)) {
                                    start = target;
                                    clearInterval(timer);
                                    counter.textContent = target.toLocaleString();
                                } else {
                                    counter.textContent = Math.floor(start).toLocaleString();
                                }
                            }, 16);
                        } else if (currentValue === 0) {
                            // Начинаем с 0
                            let start = 0;
                            const duration = 2000;
                            const increment = target / (duration / 16);
                            
                            const timer = setInterval(() => {
                                start += increment;
                                if (start >= target) {
                                    start = target;
                                    clearInterval(timer);
                                    counter.textContent = target.toLocaleString();
                                } else {
                                    counter.textContent = Math.floor(start).toLocaleString();
                                }
                            }, 16);
                        }
                        
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });
            
            counters.forEach(counter => observer.observe(counter));
        }
    } catch (error) {
        console.error('Ошибка инициализации счетчиков:', error);
    }

    // ===== КАЛЬКУЛЯТОР СТОИМОСТИ =====
    try {
        // Сбросить форму калькулятора
        function resetCalculator() {
            if (calculatorForm) {
                calculatorForm.reset();
                if (totalPrice) {
                    totalPrice.textContent = '0 ₽';
                }
            }
        }
        
        // Показать калькулятор
        window.showCalculator = function() {
            if (calculatorModal) {
                calculatorModal.style.display = 'flex';
                calculatorModal.classList.add('show');
                document.body.style.overflow = 'hidden';
                resetCalculator();
                
                // Фокус на первое поле
                setTimeout(() => {
                    const firstInput = calculatorForm.querySelector('input, select');
                    if (firstInput) firstInput.focus();
                }, 100);
            }
        };
        
        // Скрыть калькулятор
        window.hideCalculator = function() {
            if (calculatorModal) {
                calculatorModal.style.display = 'none';
                calculatorModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        };
        
        // Отправить форму калькулятора (без Telegram)
        window.submitCalculator = function() {
            // Проверяем, открыт ли калькулятор
            if (!calculatorModal || !calculatorModal.classList.contains('show')) {
                showCalculator();
                return;
            }
            
            const total = calculatePrice();
            
            // Проверяем, все ли поля заполнены
            const area = document.getElementById('area')?.value;
            const sockets = document.getElementById('sockets')?.value;
            const lights = document.getElementById('lights')?.value;
            
            if (!area || !sockets || !lights) {
                alert('Пожалуйста, заполните все поля калькулятора.');
                return;
            }
            
            // БЕЗ отправки в Telegram - только локальный алерт
            alert('Спасибо за заявку!\nПредварительная стоимость: ' + 
                  total.toLocaleString('ru-RU') + ' ₽\nНаш менеджер свяжется с вами в течение 15 минут.');
            
            // Предлагаем заполнить контактные данные
            const addContacts = confirm('Хотите оставить контактные данные для быстрой связи?');
            if (addContacts) {
                hideCalculator();
                // Прокручиваем к форме контактов
                setTimeout(() => {
                    const contactForm = document.getElementById('contact-form');
                    const contactsSection = document.querySelector('.form-section');
                    if (contactsSection) {
                        contactsSection.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => {
                            const nameInput = document.getElementById('name');
                            if (nameInput) nameInput.focus();
                        }, 500);
                    } else if (window.location.pathname.includes('contacts.html')) {
                        // Если на странице контактов
                        const contactSection = document.querySelector('.form-section');
                        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        // Перенаправляем на страницу контактов
                        window.location.href = 'contacts.html';
                    }
                }, 300);
            } else {
                resetCalculator();
                hideCalculator();
            }
        };
        
        // Слушатели для полей ввода калькулятора
        if (calculatorForm) {
            const inputFields = ['room-type', 'area', 'sockets', 'lights'];
            inputFields.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', calculatePrice);
                    element.addEventListener('change', calculatePrice);
                }
            });
        }
        
        // Обработчик для кнопки "Закрыть" в калькуляторе
        const closeCalcBtn = calculatorModal?.querySelector('.btn-calc-close');
        if (closeCalcBtn) {
            closeCalcBtn.addEventListener('click', hideCalculator);
        }
        
        // Закрытие по клику вне окна
        if (calculatorModal) {
            calculatorModal.addEventListener('click', function(e) {
                if (e.target === this) hideCalculator();
            });
        }
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && calculatorModal?.classList.contains('show')) {
                hideCalculator();
            }
        });
    } catch (error) {
        console.error('Ошибка инициализации калькулятора:', error);
    }

    // ===== ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРНЫХ ССЫЛОК =====
    try {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Закрытие мобильного меню
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu && mobileMenu.classList.contains('show')) {
                        mobileMenu.classList.remove('show');
                        const menuBtn = document.getElementById('mobile-menu-btn');
                        if (menuBtn) {
                            const icon = menuBtn.querySelector('i');
                            if (icon) {
                                icon.classList.remove('fa-times');
                                icon.classList.add('fa-bars');
                            }
                        }
                    }
                }
            });
        });
    } catch (error) {
        console.error('Ошибка плавной прокрутки:', error);
    }

    // ===== ТЕНЬ ПРИ ПРОКРУТКЕ НАВИГАЦИИ =====
    try {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 20) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
            
            // Инициализация при загрузке
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            }
        }
    } catch (error) {
        console.error('Ошибка навигации при прокрутке:', error);
    }

    // ===== АНИМАЦИЯ ПУЛЬСАЦИИ ДЛЯ КНОПКИ ТЕЛЕФОНА =====
    try {
        const phoneButtons = document.querySelectorAll('.phone-btn');
        if (phoneButtons.length) {
            let pulseInterval;
            
            function startPulseAnimation() {
                if (pulseInterval) clearInterval(pulseInterval);
                
                pulseInterval = setInterval(() => {
                    phoneButtons.forEach(button => {
                        button.classList.add('pulse-animation');
                        setTimeout(() => button.classList.remove('pulse-animation'), 2000);
                    });
                }, 5000);
            }
            
            startPulseAnimation();
            
            // Останавливаем при скролле, возобновляем при остановке
            let scrollTimer;
            window.addEventListener('scroll', function() {
                phoneButtons.forEach(button => button.classList.remove('pulse-animation'));
                clearInterval(pulseInterval);
                
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(startPulseAnimation, 1000);
            });
        }
    } catch (error) {
        console.error('Ошибка анимации пульсации:', error);
    }

    // ===== АКТИВАЦИЯ ТЕКУЩЕЙ СТРАНИЦЫ В НАВИГАЦИИ =====
    try {
        function setActiveNavigation() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            document.querySelectorAll('.nav-link').forEach(link => {
                const linkHref = link.getAttribute('href');
                
                // Простая и надежная логика определения активной страницы
                let isActive = false;
                
                if (linkHref === currentPage) {
                    isActive = true;
                } else if (currentPage === '' && linkHref === 'index.html') {
                    isActive = true;
                } else if (currentPage === 'index.html' && (linkHref === './' || linkHref === 'index.html')) {
                    isActive = true;
                } else if (linkHref && currentPage && linkHref.includes(currentPage.replace('.html', ''))) {
                    isActive = true;
                }
                
                if (isActive) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        setActiveNavigation();
        
        // Обновляем при изменении хэша (если есть SPA-навигация)
        window.addEventListener('hashchange', setActiveNavigation);
    } catch (error) {
        console.error('Ошибка активации навигации:', error);
    }

    // ===== ВАЛИДАЦИЯ ТЕЛЕФОННЫХ НОМЕРОВ =====
    try {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            // Форматирование номера
            input.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value[0] === '7' || value[0] === '8') {
                        value = value.substring(1);
                    }
                    
                    let formattedValue = '+7 (';
                    
                    if (value.length > 0) {
                        formattedValue += value.substring(0, 3);
                    }
                    if (value.length > 3) {
                        formattedValue += ') ' + value.substring(3, 6);
                    }
                    if (value.length > 6) {
                        formattedValue += '-' + value.substring(6, 8);
                    }
                    if (value.length > 8) {
                        formattedValue += '-' + value.substring(8, 10);
                    }
                    
                    this.value = formattedValue;
                }
            });
            
            // Валидация при потере фокуса
            input.addEventListener('blur', function() {
                const phoneValue = this.value.replace(/\D/g, '');
                if (phoneValue.length > 0 && phoneValue.length < 10) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            });
        });
        
        // Добавляем стиль для ошибок
        if (!document.querySelector('#phone-validation-style')) {
            const style = document.createElement('style');
            style.id = 'phone-validation-style';
            style.textContent = `
                .form-input.error {
                    border-color: #dc2626 !important;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
                }
                .form-input.error:focus {
                    border-color: #dc2626 !important;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
                }
            `;
            document.head.appendChild(style);
        }
    } catch (error) {
        console.error('Ошибка валидации телефона:', error);
    }

    // ===== ЛЕНИВАЯ ЗАГРУЗКА ИЗОБРАЖЕНИЙ =====
    try {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    } catch (error) {
        console.error('Ошибка ленивой загрузки:', error);
    }

    // ===== ОБРАБОТКА ССЫЛОК ДЛЯ ВНЕШНИХ РЕСУРСОВ =====
    try {
        // Открываем внешние ссылки в новой вкладке
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    } catch (error) {
        console.error('Ошибка обработки внешних ссылок:', error);
    }
});

// Глобальные функции для использования в HTML
if (typeof window !== 'undefined') {
    window.calculatePrice = calculatePrice;
}
