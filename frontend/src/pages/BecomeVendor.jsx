import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LoaderCircle, Store } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { vendorApplicationSchema } from '../schemas/authSchemas';

const API = 'http://localhost:5000/api';
const initialForm = {
    full_name: '', email: '', phone: '', password: '', confirm_password: '',
    store_name: '', category_id: '', business_description: '', address: '',
    city: '', postal_code: '', country: 'Bangladesh',
};

const BecomeVendor = () => {
    const { submitVendorApplication } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        let active = true;
        axios.get(`${API}/categories`)
            .then(({ data }) => {
                if (active) setCategories((data.data || []).filter((category) => category.status === 'ACTIVE'));
            })
            .catch(() => {
                if (active) setSubmitError('Business categories could not be loaded. Refresh the page to try again.');
            })
            .finally(() => {
                if (active) setLoadingCategories(false);
            });
        return () => { active = false; };
    }, []);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined, confirm_password: name === 'password' ? undefined : current.confirm_password }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError('');
        const validation = vendorApplicationSchema.safeParse(form);
        if (!validation.success) {
            const nextErrors = Object.fromEntries(validation.error.issues.map((issue) => [issue.path[0], issue.message]));
            setErrors(nextErrors);
            const firstIssue = validation.error.issues[0];
            toast.error(firstIssue.message);
            document.querySelector(`[name="${firstIssue.path[0]}"]`)?.focus();
            return;
        }

        setSubmitting(true);
        const result = await submitVendorApplication(validation.data);
        setSubmitting(false);
        if (!result.success) {
            setSubmitError(result.message);
            return;
        }
        toast.success('Your vendor application was submitted.');
        navigate(`/seller/application/${result.application_ref}`, { replace: true });
    };

    const fieldClass = (field) => `input input-bordered w-full bg-white dark:bg-gray-800 ${errors[field] ? 'input-error' : ''}`;
    const renderError = (field) => errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <main className="flex-1 py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link to="/" className="link link-hover text-sm text-gray-500 inline-flex items-center gap-2 mb-6">
                        <ArrowLeft size={16} /> Back to marketplace
                    </Link>
                    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <header className="bg-gray-900 text-white p-7 sm:p-9">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/20 text-primary flex items-center justify-center"><Store size={24} /></div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">LogeAchi Partner Program</p>
                                    <h1 className="text-2xl sm:text-3xl font-black">Become a Vendor</h1>
                                    <p className="text-sm text-gray-300 mt-2 max-w-xl">Submit your store for review. Seller access is enabled only after an administrator approves your application.</p>
                                </div>
                            </div>
                        </header>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-9 space-y-8">
                            {submitError && <div role="alert" className="alert alert-error text-sm">{submitError}</div>}
                            <section>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Account details</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <label className="form-control"><span className="label-text mb-1">Full Name</span><input name="full_name" autoComplete="name" value={form.full_name} onChange={updateField} className={fieldClass('full_name')} />{renderError('full_name')}</label>
                                    <label className="form-control"><span className="label-text mb-1">Email</span><input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} className={fieldClass('email')} />{renderError('email')}</label>
                                    <label className="form-control"><span className="label-text mb-1">Phone</span><input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateField} className={fieldClass('phone')} />{renderError('phone')}</label>
                                    <div className="hidden sm:block" />
                                    <label className="form-control"><span className="label-text mb-1">Password</span><input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} className={fieldClass('password')} />{renderError('password')}</label>
                                    <label className="form-control"><span className="label-text mb-1">Confirm Password</span><input name="confirm_password" type="password" autoComplete="new-password" value={form.confirm_password} onChange={updateField} className={fieldClass('confirm_password')} />{renderError('confirm_password')}</label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Password must be at least 6 characters and contain letters and numbers.</p>
                            </section>

                            <section>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Store profile</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <label className="form-control"><span className="label-text mb-1">Store Name</span><input name="store_name" value={form.store_name} onChange={updateField} className={fieldClass('store_name')} />{renderError('store_name')}</label>
                                    <label className="form-control"><span className="label-text mb-1">Business Category</span>
                                        <select name="category_id" value={form.category_id} onChange={updateField} className={`select select-bordered w-full bg-white dark:bg-gray-800 ${errors.category_id ? 'select-error' : ''}`} disabled={loadingCategories}>
                                            <option value="">{loadingCategories ? 'Loading categories…' : 'Choose a category'}</option>
                                            {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
                                        </select>{renderError('category_id')}
                                    </label>
                                    <label className="form-control sm:col-span-2"><span className="label-text mb-1">Business Description</span><textarea name="business_description" value={form.business_description} onChange={updateField} rows={4} maxLength={3000} className={`textarea textarea-bordered w-full bg-white dark:bg-gray-800 ${errors.business_description ? 'textarea-error' : ''}`} placeholder="What do you sell, and what makes your business distinctive?" />{renderError('business_description')}</label>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Business address</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <label className="form-control sm:col-span-2"><span className="label-text mb-1">Address</span><input name="address" autoComplete="street-address" value={form.address} onChange={updateField} className={fieldClass('address')} />{renderError('address')}</label>
                                    <label className="form-control"><span className="label-text mb-1">City</span><input name="city" autoComplete="address-level2" value={form.city} onChange={updateField} className={fieldClass('city')} />{renderError('city')}</label>
                                    <label className="form-control"><span className="label-text mb-1">Postal Code</span><input name="postal_code" autoComplete="postal-code" value={form.postal_code} onChange={updateField} className={fieldClass('postal_code')} />{renderError('postal_code')}</label>
                                    <label className="form-control"><span className="label-text mb-1">Country</span><input name="country" autoComplete="country-name" value={form.country} onChange={updateField} className={fieldClass('country')} />{renderError('country')}</label>
                                </div>
                            </section>

                            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-xs text-gray-500 max-w-sm">Your application is reviewed by our team. Submitting does not create an active seller account.</p>
                                <button type="submit" disabled={submitting || loadingCategories || categories.length === 0} className="btn btn-primary text-white min-w-48">
                                    {submitting ? <><LoaderCircle size={17} className="animate-spin" /> Submitting…</> : <>Submit Application <ArrowRight size={17} /> </>}
                                </button>
                            </div>
                        </form>
                    </section>
                    <p className="text-center text-sm text-gray-500 mt-5">Already approved? <Link to="/login?role=seller" className="link link-primary">Sign in to Seller Central</Link></p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BecomeVendor;
