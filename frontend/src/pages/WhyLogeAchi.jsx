import { useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    CreditCard,
    HeartHandshake,
    MessageCircle,
    PackageCheck,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Store,
    Truck,
    Users,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import badhonImage from '../assets/Badhon.png';
import supervisorImage from '../assets/Supervisor-KRV-Sir.png';
import joyaImage from '../assets/Joya.png';
import './WhyLogeAchi.css';

const features = [
    {
        icon: Truck,
        title: 'Fast delivery',
        description: 'Your next favorite find, delivered without the long wait.',
        accent: 'orange',
        detail: 'QUICK TO YOUR DOOR',
    },
    {
        icon: BadgeCheck,
        title: 'Authentic products',
        description: 'Shop confidently with quality products from trusted sellers.',
        accent: 'green',
        detail: 'QUALITY YOU CAN TRUST',
    },
    {
        icon: Users,
        title: 'A growing community',
        description: 'A demo milestone of 1M+ shoppers discovering more together.',
        accent: 'blue',
        detail: '1M+ DEMO SHOPPERS',
    },
    {
        icon: ShieldCheck,
        title: 'Secure shopping',
        description: 'A checkout experience designed to keep every order protected.',
        accent: 'violet',
        detail: 'SHOP WITH CONFIDENCE',
    },
    {
        icon: Store,
        title: 'One marketplace, many finds',
        description: 'Explore products and independent sellers all in one place.',
        accent: 'blue',
        detail: 'A WORLD OF CHOICE',
    },
    {
        icon: Sparkles,
        title: 'Great deals, daily',
        description: 'Discover standout picks and offers worth coming back for.',
        accent: 'orange',
        detail: 'MORE VALUE, EVERY DAY',
    },
    {
        icon: Star,
        title: 'Real customer reviews',
        description: 'Make your next choice with helpful feedback from shoppers.',
        accent: 'yellow',
        detail: 'SHOPPER-LED INSIGHT',
    },
    {
        icon: HeartHandshake,
        title: 'Here when you need us',
        description: 'A thoughtful team is ready to help make shopping easier.',
        accent: 'green',
        detail: 'CARE THAT COMES THROUGH',
    },
];

const team = [
    {
        name: 'Badhon Pain',
        role: 'Developer',
        description: "BUET CSE '24",
        projects: [
            { label: 'AlgoVista', href: 'https://github.com/BadhonPain/AlgoVista' },
            { label: 'Angry Bird', href: 'https://github.com/BadhonPain/Angry_Birds_project' },
        ],
        image: badhonImage,
        alt: 'Badhon Pain',
    },
    {
        name: 'Kowshic Roy',
        role: 'Project supervisor',
        description: 'Lecturer\nDepartment of CSE, BUET',
        image: supervisorImage,
        alt: 'Kowshic Roy, project supervisor',
        supervisor: true,
    },
    {
        name: 'Joyshree Mukharjee',
        role: 'Developer',
        description: "BUET CSE '24",
        projects: [
            { label: 'AlgoVista', href: 'https://github.com/BadhonPain/AlgoVista' },
            { label: 'Angry Bird', href: 'https://github.com/BadhonPain/Angry_Birds_project' },
        ],
        image: joyaImage,
        alt: 'Joyshree Mukharjee',
    },
];

const WhyLogeAchi = () => {
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const revealItems = document.querySelectorAll('.why-reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14 });

        revealItems.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="why-page min-h-screen bg-[#fcfcfc] text-gray-900 dark:bg-gray-950 dark:text-white">
            <Navbar />
            <main>
                <section className="why-hero relative overflow-hidden">
                    <div className="why-hero-orbit why-orbit-one" aria-hidden="true" />
                    <div className="why-hero-orbit why-orbit-two" aria-hidden="true" />
                    <div className="why-hero-inner relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
                        <div className="why-reveal">
                            <div className="why-eyebrow"><Sparkles size={14} /> A BETTER WAY TO FIND YOUR NEXT FAVORITE</div>
                            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.04] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
                                Shopping should feel <span>like a good find.</span>
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg dark:text-gray-300">
                                LogeAchi brings trusted sellers, thoughtful service, and everyday discoveries together in one place, so the good stuff is always closer.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-4">
                                <Link to="/categories" className="btn btn-primary why-primary-cta">
                                    Explore the marketplace <ArrowRight size={18} />
                                </Link>
                                <a href="#why-us" className="why-text-link">See what makes us different</a>
                            </div>
                            <div className="why-proof mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                <span><ShieldCheck size={17} /> Secure checkout</span>
                                <span><PackageCheck size={17} /> Verified sellers</span>
                                <span><MessageCircle size={17} /> People-first support</span>
                            </div>
                        </div>

                        <div className="why-hero-art why-reveal" aria-label="LogeAchi marketplace highlights">
                            <div className="why-art-ring" />
                            <div className="why-art-main">
                                <div className="why-art-topline"><span className="why-live-dot" /> YOUR NEXT GREAT FIND</div>
                                <div className="why-art-bag"><ShoppingBag size={72} strokeWidth={1.2} /></div>
                                <div className="why-art-label">A little more <strong>LogeAchi</strong></div>
                                <div className="why-art-subtitle">Good finds. Good people. All in one place.</div>
                            </div>
                            <div className="why-float-note why-float-note-one"><Truck size={17} /> Fast delivery</div>
                            <div className="why-float-note why-float-note-two"><CreditCard size={17} /> Secure checkout</div>
                            <Sparkles className="why-art-sparkle sparkle-a" size={25} aria-hidden="true" />
                            <Sparkles className="why-art-sparkle sparkle-b" size={32} aria-hidden="true" />
                        </div>
                    </div>
                    <div className="why-hero-bottom" />
                </section>

                <section id="why-us" className="why-features-section px-5 py-20 md:px-8 md:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="why-section-heading why-reveal">
                            <span className="why-kicker">THE LOGEACHI DIFFERENCE</span>
                            <h2>More than a place to shop.</h2>
                            <p>Every detail is here to make finding, choosing, and receiving what you love feel easy.</p>
                        </div>
                        <div className="why-feature-grid mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map(({ icon: Icon, title, description, accent, detail }, index) => (
                                <article className={`why-feature-card accent-${accent} why-reveal`} key={title} style={{ '--reveal-delay': `${index * 65}ms` }}>
                                    <div className="why-feature-top">
                                        <span className="why-feature-icon"><Icon size={21} strokeWidth={1.8} /></span>
                                        <span className="why-feature-index">0{index + 1}</span>
                                    </div>
                                    <div className="why-feature-copy">
                                        <span className="why-feature-detail">{detail}</span>
                                        <h3>{title}</h3>
                                        <p>{description}</p>
                                    </div>
                                    <span className="why-feature-arrow"><ArrowRight size={16} /></span>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="why-team-section px-5 py-20 md:px-8 md:py-24">
                    <div className="why-team-inner mx-auto max-w-7xl">
                        <div className="why-section-heading why-team-heading why-reveal">
                            <span className="why-kicker">THE PEOPLE BEHIND THE EXPERIENCE</span>
                            <h2>Meet the team.</h2>
                            <p>A small team with a shared goal: make online shopping feel more human.</p>
                        </div>
                        <div className="why-team-stage">
                            <span className="why-team-glow" aria-hidden="true" />
                            <span className="why-team-particle particle-one" aria-hidden="true" />
                            <span className="why-team-particle particle-two" aria-hidden="true" />
                            <span className="why-team-particle particle-three" aria-hidden="true" />
                            <span className="why-team-particle particle-four" aria-hidden="true" />
                            <div className="why-team-grid">
                                {team.map((member, index) => (
                                    <article className={`why-person why-reveal ${member.supervisor ? 'why-supervisor' : ''}`} key={member.name} style={{ '--reveal-delay': `${index * 100}ms` }}>
                                        <div className="why-person-image-wrap">
                                            <span className="why-person-aura" aria-hidden="true" />
                                            <img src={member.image} alt={member.alt} loading="lazy" />
                                        </div>
                                        <div className="why-person-copy">
                                            {member.supervisor && <span className="why-supervisor-tag">PROJECT SUPERVISOR</span>}
                                            <h3>{member.name}</h3>
                                            {!member.supervisor && <span className="why-person-role">{member.role}</span>}
                                            <p>{member.description}</p>
                                            {member.projects && (
                                                <>
                                                    <span className="why-project-intro">Developer of</span>
                                                    <div className="why-project-links" aria-label={`${member.name}'s projects`}>
                                                        {member.projects.map((project) => (
                                                            <a href={project.href} key={project.label} target="_blank" rel="noreferrer">
                                                                {project.label}<ArrowUpRight size={13} aria-hidden="true" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="why-cta-section px-5 py-16 md:px-8 md:py-20">
                    <div className="why-cta-inner why-reveal mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                        <div>
                            <span className="why-kicker">YOUR NEXT GOOD FIND IS WAITING</span>
                            <h2>Make room for a little more.</h2>
                            <p>Explore the marketplace and find something that feels just right.</p>
                        </div>
                        <Link to="/categories" className="btn why-cta-button">
                            Start Shopping <ArrowRight size={19} />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default WhyLogeAchi;