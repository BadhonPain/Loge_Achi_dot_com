import { ArrowLeft, ArrowRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const supportEmail = 'support@logeachi.com';

const pages = {
    'help-center': {
        label: 'CUSTOMER CARE',
        title: 'How can we help?',
        intro: 'Get help with shopping, accounts, payments, or an order. Our support team is the quickest way to get a real answer.',
        sections: [
            ['Orders and delivery', 'For an order question, include the email used at checkout and your order number so our team can look into it.'],
            ['Products and sellers', 'Product details and availability can vary by seller. Contact support with the product name and seller if something needs attention.'],
            ['Account access', 'For account help, write from the email address connected to your LogeAchi account.'],
        ],
        action: { label: 'Email customer support', href: `mailto:${supportEmail}` },
    },
    'how-to-buy': {
        label: 'SHOPPING GUIDE',
        title: 'A few steps to a good find.',
        intro: 'Browse the marketplace, compare product details, and place your order through a straightforward checkout.',
        sections: [
            ['01. Find your product', 'Browse categories or search the marketplace to discover products from different sellers.'],
            ['02. Review the details', 'Check the description, price, seller information, and available options before adding a product to your cart.'],
            ['03. Checkout securely', 'Sign in or create an account, confirm your delivery details, and choose an available payment method.'],
            ['04. Need a hand?', 'Contact customer support with your order details if you have a question after placing your order.'],
        ],
        action: { label: 'Browse products', to: '/categories' },
    },
    'returns-refunds': {
        label: 'ORDER SUPPORT',
        title: 'Returns & refunds',
        intro: 'If something is not right with an order, contact our support team with the order number and a short description of the issue.',
        sections: [
            ['Start a request', 'Email support from the address on your account. Include the order number and the product you need help with.'],
            ['What happens next', 'Our team will review the details and explain the options available for that order. Return and refund eligibility may depend on the product and seller.'],
            ['Keep your order details', 'Hold on to your order confirmation and any relevant photos or seller messages while the request is reviewed.'],
        ],
        action: { label: 'Ask about an order', href: `mailto:${supportEmail}?subject=Returns%20and%20refunds` },
    },
    'corporate-vouchers': {
        label: 'BUSINESS ENQUIRIES',
        title: 'Corporate vouchers',
        intro: 'Planning a team gift or a customer reward? Tell us a little about your organization and what you have in mind.',
        sections: [
            ['Share your requirements', 'Include an approximate quantity, preferred timeline, and any questions about voucher options.'],
            ['We will follow up', 'Our team can discuss availability and next steps directly with you.'],
        ],
        action: { label: 'Enquire about vouchers', href: `mailto:${supportEmail}?subject=Corporate%20voucher%20enquiry` },
    },
    'about-us': {
        label: 'ABOUT LOGEACHI',
        title: 'Good finds, brought together.',
        intro: 'LogeAchi is a multi-vendor marketplace built to make discovering products and shopping from trusted sellers feel simple.',
        sections: [
            ['A marketplace for discovery', 'Explore products across categories and find independent sellers in one convenient place.'],
            ['Built around trust', 'Clear product details, customer feedback, and accessible support help shoppers make confident choices.'],
        ],
        action: { label: 'Why LogeAchi?', to: '/why-logeachi' },
    },
    careers: {
        label: 'CAREERS',
        title: 'Build what comes next.',
        intro: 'Interested in contributing to LogeAchi? Send us a short introduction and tell us what kind of work you would love to do.',
        sections: [
            ['Reach the team', 'Include your area of interest, a portfolio or résumé link, and the best way to contact you.'],
        ],
        action: { label: 'Contact us about careers', href: `mailto:${supportEmail}?subject=Careers%20at%20LogeAchi` },
    },
    blog: {
        label: 'THE LOGEACHI JOURNAL',
        title: 'Ideas for better finds.',
        intro: 'A little inspiration for discovering products, shopping with confidence, and supporting independent sellers.',
        sections: [
            ['Shop with confidence', 'Take a moment to review product descriptions, seller information, and customer feedback before choosing.'],
            ['Explore beyond the usual', 'Different sellers bring different perspectives. Browse a category and see what catches your eye.'],
            ['Have a story idea?', 'We would love to hear what you want to read about. Send the team a note.'],
        ],
        action: { label: 'Suggest a story', href: `mailto:${supportEmail}?subject=LogeAchi%20Journal%20idea` },
    },
    'terms-and-conditions': {
        label: 'STORE INFORMATION',
        title: 'Terms & conditions',
        intro: 'These store terms describe the basic expectations for using the LogeAchi marketplace.',
        sections: [
            ['Accounts', 'Keep your account details accurate and protect your sign-in credentials. Activity made through your account may be treated as your activity.'],
            ['Products and orders', 'Product information is provided by marketplace sellers. Availability, pricing, and fulfilment details are confirmed during the order process.'],
            ['Payments and support', 'Use the payment methods shown at checkout. Contact support if you have a question about an order, payment, or listing.'],
            ['Updates', 'Marketplace features and these terms may change as the service develops. Check this page for the current information.'],
        ],
        action: { label: 'Ask a question', href: `mailto:${supportEmail}?subject=Terms%20and%20conditions` },
    },
    'privacy-policy': {
        label: 'STORE INFORMATION',
        title: 'Privacy policy',
        intro: 'This page explains the kinds of information used to operate your LogeAchi account and marketplace experience.',
        sections: [
            ['Information you provide', 'Account, contact, delivery, and order details are used to support shopping and fulfilment.'],
            ['Marketplace operations', 'Relevant order details may be shared with the seller or delivery provider involved in fulfilling an order.'],
            ['Your choices', 'Contact support to ask about your account information or privacy questions. Avoid sending passwords or payment credentials by email.'],
            ['Keeping this policy current', 'Privacy practices may evolve as the marketplace develops. This page will be updated to reflect meaningful changes.'],
        ],
        action: { label: 'Contact privacy support', href: `mailto:${supportEmail}?subject=Privacy%20question` },
    },
};

const FooterInfoPage = () => {
    const { slug } = useParams();
    const page = pages[slug];

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-gray-900 dark:bg-gray-950 dark:text-white">
            <Navbar />
            <main className="min-h-[65vh] px-5 py-14 md:px-8 md:py-20">
                <div className="mx-auto max-w-5xl">
                    <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-primary dark:text-gray-400">
                        <ArrowLeft size={16} /> Back to LogeAchi
                    </Link>
                    {page ? (
                        <>
                            <header className="max-w-3xl border-b border-gray-200 pb-9 dark:border-gray-800">
                                <span className="text-xs font-bold tracking-[0.14em] text-primary">{page.label}</span>
                                <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{page.title}</h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">{page.intro}</p>
                            </header>
                            <div className="grid gap-x-12 gap-y-9 py-10 md:grid-cols-2">
                                {page.sections.map(([heading, body]) => (
                                    <section key={heading} className="max-w-xl">
                                        <h2 className="flex items-center gap-2 text-lg font-bold">
                                            {slug === 'privacy-policy' ? <ShieldCheck size={18} className="text-primary" /> : null}
                                            {heading}
                                        </h2>
                                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{body}</p>
                                    </section>
                                ))}
                            </div>
                            {page.action.to ? (
                                <Link to={page.action.to} className="btn btn-primary inline-flex items-center gap-2 rounded-md">
                                    {page.action.label}<ArrowRight size={17} />
                                </Link>
                            ) : (
                                <a href={page.action.href} className="btn btn-primary inline-flex items-center gap-2 rounded-md">
                                    {page.action.label}<Mail size={17} />
                                </a>
                            )}
                            {slug === 'help-center' && (
                                <a href="tel:+8801234567890" className="ml-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary dark:text-gray-300">
                                    <Phone size={15} /> Call support
                                </a>
                            )}
                        </>
                    ) : (
                        <div className="py-16">
                            <h1 className="text-3xl font-black">Page not found</h1>
                            <p className="mt-3 text-gray-600 dark:text-gray-400">This footer destination is not available.</p>
                            <Link to="/" className="mt-6 inline-flex items-center gap-2 font-bold text-primary">Return home <ArrowRight size={16} /></Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FooterInfoPage;