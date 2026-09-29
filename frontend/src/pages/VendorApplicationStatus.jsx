import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, LoaderCircle, Store } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const API = 'http://localhost:5000/api';

const STATUS_COPY = {
    PENDING: { title: 'Application Submitted', detail: 'Your application is in the review queue.', icon: Clock3 },
    UNDER_REVIEW: { title: 'Application Under Review', detail: 'Our team is reviewing your business information.', icon: Clock3 },
    APPROVED: { title: 'Application Approved', detail: 'Your seller account is ready. Sign in to open Seller Central.', icon: CheckCircle2 },
    REJECTED: { title: 'Application Not Approved', detail: 'Review the reason below. You may submit a new application after addressing it.', icon: AlertCircle },
};

const VendorApplicationStatus = () => {
    const { reference } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        axios.get(`${API}/vendor-applications/status/${reference}`)
            .then(({ data }) => { if (active) setApplication(data.data); })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'Could not load application status');
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [reference]);

    const state = application && STATUS_COPY[application.status];
    const StateIcon = state?.icon || Store;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <main className="flex-1 px-4 py-14 flex items-start justify-center">
                <section className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-7 sm:p-10">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-12 text-gray-500"><LoaderCircle className="animate-spin" /> Loading application status…</div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                            <h1 className="text-xl font-bold mb-2">Application not found</h1>
                            <p className="text-sm text-gray-500">{error}</p>
                            <Link to="/seller" className="btn btn-primary text-white mt-6">Return to application</Link>
                        </div>
                    ) : (
                        <>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${application.status === 'REJECTED' ? 'bg-red-100 text-red-600' : application.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                <StateIcon size={28} />
                            </div>
                            <p className="text-xs font-bold tracking-wider uppercase text-primary mb-2">Vendor application</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{state.title}</h1>
                            <p className="text-sm text-gray-500 mt-2">{state.detail}</p>
                            <div className="mt-7 border-y border-gray-100 dark:border-gray-800 py-5 space-y-2 text-sm">
                                <p><span className="text-gray-500">Applicant:</span> <strong>{application.full_name}</strong></p>
                                <p><span className="text-gray-500">Store:</span> <strong>{application.store_name}</strong></p>
                                <p><span className="text-gray-500">Status:</span> <span className="badge badge-outline">{application.status.replace('_', ' ')}</span></p>
                            </div>
                            {application.status === 'REJECTED' && application.rejection_reason && (
                                <div className="alert alert-error mt-5 text-sm"><span><strong>Reason:</strong> {application.rejection_reason}</span></div>
                            )}
                            {application.status === 'APPROVED' ? (
                                <Link to="/login?role=seller" className="btn btn-primary text-white mt-7">Sign in to Seller Central <ArrowRight size={17} /></Link>
                            ) : application.status === 'REJECTED' ? (
                                <Link to="/seller" className="btn btn-primary text-white mt-7">Submit a new application <ArrowRight size={17} /></Link>
                            ) : (
                                <p className="text-xs text-gray-500 mt-6">You can return to this page to check for updates. Seller dashboard access is not available until approval.</p>
                            )}
                        </>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default VendorApplicationStatus;
