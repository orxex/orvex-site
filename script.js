document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        // ─── SPLINE INJECTION (DESKTOP ONLY) ──────────────────────────────────────
        const splineHero = document.getElementById('spline-container-1');
        if (splineHero && !splineHero.hasChildNodes()) {
            splineHero.innerHTML = '<spline-viewer url="./scene.splinecode" style="transform: translateZ(0);"></spline-viewer>';
        }
        
        const splineExp = document.getElementById('spline-container-2');
        if (splineExp && !splineExp.hasChildNodes()) {
            splineExp.innerHTML = '<iframe src="https://my.spline.design/robotarm-qtRdcEV6VaeDtXNzKLIQSPP8/" frameborder="0" allow="autoplay" loading="lazy" style="width:100%;height:100%;position:absolute;top:0;left:0;border:none;display:block;"></iframe>';
        }

        // ─── HERO ANIMATIONS ──────────────────────────────────────────────────────
        gsap.set(".top-logo",       { y: -20, opacity: 0 });
        gsap.set(".logo-icon-image",{ opacity: 0, x: -20 });
        gsap.set(".brand-name",     { opacity: 0, x: -20 });
        gsap.set(".brand-tagline",  { opacity: 0, y: 15 });
        gsap.set(".hero-cta",       { opacity: 0, y: 15 });
        gsap.set(".anim-social",    { x: -20, opacity: 0 });
        gsap.set(".anim-spline",    { opacity: 0 });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.to(".top-logo", { y: 0, opacity: 1, duration: 0.8 })
          .to([".logo-icon-image", ".brand-name"], { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=1.0")
          .to([".brand-tagline", ".hero-cta"], { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=1.0")
          .to(".anim-social", { x: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.8")
          .to(".anim-spline", { opacity: 1, duration: 1.2 }, "-=0.5");

        // ─── SCROLL REVEAL ────────────────────────────────────────────────────────
        gsap.utils.toArray('.anim-reveal').forEach(el => {
            if (el.classList.contains('step')) return; 
            gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } });
        });

        function animateGrid(cssSelector, onComplete) {
            const elements = document.querySelectorAll(cssSelector);
            if (!elements.length) return;
            gsap.to(elements, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: elements[0], start: "top 80%", toggleActions: "play none none none" }, onComplete: onComplete || null });
        }

        animateGrid(".service-card");
        animateGrid(".project-card");
        animateGrid(".feature-item");
        animateGrid(".step", () => {
            const firstStep = document.querySelector('.step[data-step="1"]');
            if (firstStep && typeof activateStep === 'function') activateStep(firstStep);
        });

        // ─── SEÇÃO XP — EXPERIÊNCIAS QUE IMPRESSIONAM ────────────────────────────
        const xpSection = document.querySelector('.xp-section');
        if (xpSection) {
            const xpTl = gsap.timeline({ scrollTrigger: { trigger: xpSection, start: "top 72%", toggleActions: "play none none none" } });
            xpTl.to('.xp-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
                .to('.xp-line-white', { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
                .to('.xp-line-muted', { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
                .to('.xp-subtitle', { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.45")
                .to('.xp-cta', { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.45");
        }

        return () => {
            if (splineHero) splineHero.innerHTML = '';
            if (splineExp) splineExp.innerHTML = '';
        };
    });

    mm.add("(max-width: 768px)", () => {
        // Nenhuma animação GSAP. Mobile é 100% estático para super performance.
        // Ativamos o passo 1 do processo "Como Trabalhamos" após o carregamento inicial.
        setTimeout(() => {
            const firstStep = document.querySelector('.step[data-step="1"]');
            if (firstStep && typeof activateStep === 'function') activateStep(firstStep);
        }, 500);

        return () => {};
    });

    // ─── PROCESSO INTERATIVO ──────────────────────────────────────────────────
    const stepsData = {
        1: {
            title: "Entendimento",
            description: "Analisamos profundamente sua ideia, objetivos e público-alvo para entender exatamente o que precisa ser construído.",
            icon: "ph-magnifying-glass"
        },
        2: {
            title: "Planejamento",
            description: "Estruturamos a solução ideal, definindo layout, tecnologia e estratégia para garantir o melhor resultado.",
            icon: "ph-map-trifold"
        },
        3: {
            title: "Criação",
            description: "Desenvolvemos o projeto com foco em design premium, performance e experiência do usuário.",
            icon: "ph-pen-nib"
        },
        4: {
            title: "Entrega",
            description: "Finalizamos, revisamos e entregamos um produto pronto para gerar resultados reais.",
            icon: "ph-rocket-launch"
        }
    };

    const steps       = document.querySelectorAll('.step');
    const panel       = document.getElementById('process-panel');
    const panelInner  = document.getElementById('process-panel-inner');
    const panelTag    = document.getElementById('panel-step-tag');
    const panelTitle  = document.getElementById('panel-title');
    const panelDesc   = document.getElementById('panel-description');
    const panelIconEl = document.getElementById('panel-icon-el');
    const lineActive  = document.getElementById('process-line-active');

    let activeStep = null;
    let panelAnimating = false;

    // Larguras da linha de progresso por etapa (desktop)
    const lineWidths = ['12%', '38%', '62%', '88%'];

    function updateLineProgress(stepNum) {
        if (window.innerWidth > 1000) {
            gsap.to(lineActive, {
                width: lineWidths[stepNum - 1],
                duration: 0.55,
                ease: "power2.inOut"
            });
        } else {
            // Mobile: linha vertical
            const lineHeights = ['12%', '38%', '62%', '88%'];
            gsap.to(lineActive, {
                height: lineHeights[stepNum - 1],
                duration: 0.55,
                ease: "power2.inOut"
            });
        }
    }

    function setPanelContent(stepNum, stepEl) {
        const data = stepsData[stepNum];
        panelTag.textContent   = stepEl.querySelector('.step-number').textContent;
        panelTitle.textContent = data.title;
        panelDesc.textContent  = data.description;
        panelIconEl.className  = `ph ${data.icon}`;
    }

    function activateStep(stepEl) {
        if (panelAnimating) return;
        const stepNum = parseInt(stepEl.dataset.step);

        // Destacar step ativo
        steps.forEach(s => s.classList.remove('active'));
        stepEl.classList.add('active');

        updateLineProgress(stepNum);

        if (!panel.classList.contains('is-open')) {
            // 1ª abertura: define conteúdo, abre o painel com GSAP e depois anima o inner
            setPanelContent(stepNum, stepEl);
            panel.classList.add('is-open');
            panelAnimating = true;

            gsap.fromTo(panelInner,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out",
                  delay: 0.12,
                  onComplete: () => { panelAnimating = false; }
                }
            );
        } else {
            // Troca de etapa: fade out → atualiza conteúdo → fade in
            panelAnimating = true;
            gsap.to(panelInner, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    setPanelContent(stepNum, stepEl);
                    gsap.to(panelInner, {
                        opacity: 1,
                        y: 0,
                        duration: 0.35,
                        ease: "power3.out",
                        onComplete: () => { panelAnimating = false; }
                    });
                }
            });
        }

        activeStep = stepNum;
    }

    function deactivateAll() {
        steps.forEach(s => s.classList.remove('active'));
        gsap.to(panelInner, { opacity: 0, y: 10, duration: 0.2, ease: "power2.in",
            onComplete: () => {
                panel.classList.remove('is-open');
                gsap.to(lineActive, { width: '0%', height: '0%', duration: 0.4, ease: "power2.inOut" });
            }
        });
        activeStep = null;
    }

    // Event listeners
    steps.forEach(stepEl => {
        stepEl.addEventListener('click', () => {
            const stepNum = parseInt(stepEl.dataset.step);
            if (activeStep === stepNum) {
                deactivateAll(); // toggle: clique no ativo fecha o painel
            } else {
                activateStep(stepEl);
            }
        });

        // Suporte a teclado (Enter / Espaço)
        stepEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                stepEl.click();
            }
        });
    });

});
