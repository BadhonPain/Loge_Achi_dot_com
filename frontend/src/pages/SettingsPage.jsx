import { useContext, useEffect, useRef, useState } from 'react';
import { Camera, KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER = API.replace(/\/api\/?$/, '');

const SettingsPage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const photoInput = useRef(null);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileImage, setProfileImage] = useState(user?.profile_image || '');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const photoPreviewUrl = useRef('');
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        let active = true;
        axios.get(`${API}/auth/profile`)
            .then(({ data }) => {
                if (!active) return;
                setName(data.data.name || '');
                setEmail(data.data.email || '');
                setProfileImage(data.data.profile_image || '');
            })
            .catch((error) => {
                if (active) toast.error(error.response?.data?.message || 'Could not load account settings');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [user?.id, user?.role]);

    useEffect(() => () => {
        if (photoPreviewUrl.current) URL.revokeObjectURL(photoPreviewUrl.current);
    }, []);

    const selectPhoto = (event) => {
        if (photoPreviewUrl.current) URL.revokeObjectURL(photoPreviewUrl.current);
        const file = event.target.files?.[0] || null;
        photoPreviewUrl.current = file ? URL.createObjectURL(file) : '';
        setPhotoFile(file);
        setPhotoPreview(photoPreviewUrl.current);
    };

    const clearPhotoPreview = () => {
        if (photoPreviewUrl.current) URL.revokeObjectURL(photoPreviewUrl.current);
        photoPreviewUrl.current = '';
        setPhotoPreview('');
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        setSavingProfile(true);
        try {
            const { data } = await axios.patch(`${API}/auth/profile`, { name });
            setName(data.data.name);
            updateUser({ name: data.data.name });
            toast.success('Name updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update name');
        } finally {
            setSavingProfile(false);
        }
    };

    const uploadPhoto = async (event) => {
        event.preventDefault();
        if (!photoFile) return;
        const formData = new FormData();
        formData.append('profile_image', photoFile);
        setUploadingPhoto(true);
        try {
            const { data } = await axios.post(`${API}/auth/profile-image`, formData);
            setProfileImage(data.data.profile_image);
            setPhotoFile(null);
            clearPhotoPreview();
            updateUser({ profile_image: data.data.profile_image });
            if (photoInput.current) photoInput.current.value = '';
            toast.success('Profile photo updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not upload profile photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const changePassword = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setSavingPassword(true);
        try {
            await axios.put(`${API}/auth/password`, { currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update password');
        } finally {
            setSavingPassword(false);
        }
    };

    const imageUrl = photoPreview || (profileImage ? `${SERVER}${profileImage}` : '');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
                <header className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center">
                        <UserRound size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Account settings</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role} account</p>
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 text-center text-sm text-gray-500">Loading account settings…</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <div className="space-y-6">
                            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <UserRound size={18} className="text-primary" />
                                    <h2 className="font-bold text-gray-900 dark:text-white">Profile details</h2>
                                </div>
                                <form onSubmit={saveProfile} className="space-y-4">
                                    <label className="form-control w-full">
                                        <span className="label-text text-sm font-semibold mb-1.5">Full name</span>
                                        <input
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            className="input input-bordered w-full"
                                            minLength={2}
                                            maxLength={100}
                                            required
                                        />
                                    </label>
                                    <label className="form-control w-full">
                                        <span className="label-text text-sm font-semibold mb-1.5">Email</span>
                                        <input value={email} className="input input-bordered w-full opacity-70" readOnly />
                                    </label>
                                    <button type="submit" className="btn btn-primary text-white gap-2" disabled={savingProfile}>
                                        <Save size={16} /> {savingProfile ? 'Saving…' : 'Save name'}
                                    </button>
                                </form>
                            </section>

                            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <Camera size={18} className="text-primary" />
                                    <h2 className="font-bold text-gray-900 dark:text-white">Profile photo</h2>
                                </div>
                                <form onSubmit={uploadPhoto} className="flex flex-col sm:flex-row sm:items-center gap-5">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-950 text-primary flex items-center justify-center text-3xl font-black">
                                            {name.charAt(0).toUpperCase() || <UserRound size={30} />}
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <input
                                            ref={photoInput}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={selectPhoto}
                                            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
                                        />
                                        <button type="submit" className="btn btn-outline btn-sm gap-2" disabled={!photoFile || uploadingPhoto}>
                                            <Camera size={15} /> {uploadingPhoto ? 'Uploading…' : 'Upload photo'}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>

                        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <KeyRound size={18} className="text-primary" />
                                <h2 className="font-bold text-gray-900 dark:text-white">Change password</h2>
                            </div>
                            <form onSubmit={changePassword} className="space-y-4">
                                <label className="form-control w-full">
                                    <span className="label-text text-sm font-semibold mb-1.5">Current password</span>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(event) => setCurrentPassword(event.target.value)}
                                        className="input input-bordered w-full"
                                        autoComplete="current-password"
                                        required
                                    />
                                </label>
                                <label className="form-control w-full">
                                    <span className="label-text text-sm font-semibold mb-1.5">New password</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        className="input input-bordered w-full"
                                        minLength={8}
                                        autoComplete="new-password"
                                        required
                                    />
                                </label>
                                <label className="form-control w-full">
                                    <span className="label-text text-sm font-semibold mb-1.5">Confirm new password</span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        className="input input-bordered w-full"
                                        minLength={8}
                                        autoComplete="new-password"
                                        required
                                    />
                                </label>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <ShieldCheck size={14} /> Use at least 8 letters and numbers, including one of each.
                                </p>
                                <button type="submit" className="btn btn-primary text-white gap-2" disabled={savingPassword}>
                                    <KeyRound size={16} /> {savingPassword ? 'Updating…' : 'Update password'}
                                </button>
                            </form>
                        </section>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default SettingsPage;