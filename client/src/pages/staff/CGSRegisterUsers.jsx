import { useState } from 'react';
import { Search, UserX, UserPlus, Info, ShieldCheck, Mail, Database } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

import SearchUserForm from '../../components/users/SearchUserForm';
import UserDetailCard from '../../components/users/UserDetailCard';
import ConfirmRegisterModal from '../../components/modal/ConfirmRegisterModal';

export default function CGSRegisterUsers() {
  const [users, setUsers] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSearch = (role, idValue, departmentCode, examinerType) => {
    setIsSearching(true);
    setHasSearched(true);
    setSearchResult(null);

    // 🔧 Simulated backend behavior (to be replaced with API)
    setTimeout(() => {
      setIsSearching(false);
      if (role === 'Examiner' && idValue) {
        setSearchResult({
          id: 'temp-user',
          role,
          email: idValue,
          departmentCode,
          examinerType,
          status: 'Unregistered',
          name: 'Simulated User',
        });
        return;
      }
      toast.error('No user found matching the search criteria.');
    }, 500);
  };

  const handleRegister = () => {
    setShowConfirmModal(true);
  };

  const confirmRegistration = () => {
    if (!searchResult) return;

    setUsers((prev) => [
      ...prev,
      { ...searchResult, id: crypto.randomUUID(), status: 'Registered' },
    ]);

    setSearchResult((prev) =>
      prev ? { ...prev, status: 'Registered' } : null
    );

    setShowConfirmModal(false);
    toast.success('User registered successfully!');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-full px-6 mx-auto pb-12"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-white" />
            Register Portal Users
          </h1>
          <p className="text-blue-100 font-medium text-lg max-w-2xl">
            Onboard new students, supervisors, and examiners by searching external databases or manually registering them into the AIU PG Portal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Column */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden sticky top-8">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                User Search
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Enter details to fetch user information from the central database.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <SearchUserForm onSearch={handleSearch} isSearching={isSearching} />
            </CardContent>
          </Card>

          <div className="mt-6 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
            <div className="p-2 bg-blue-600 text-white rounded-xl grow-0 h-fit shadow-sm">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Registration Policy</p>
              <p className="text-xs font-medium text-blue-600 leading-relaxed italic">
                All new users must be verified against HR/Student records before registration. Ensure information is accurate to avoid duplication.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Results Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 px-2">
            <Database className="w-5 h-5 text-blue-600" />
            Search Results & Identification
          </h2>

          <AnimatePresence mode="wait">
            {!hasSearched ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-20 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold text-lg">Waiting for your search...</p>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">Fill the form on the left to begin the registration process.</p>
              </motion.div>
            ) : searchResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <UserDetailCard
                  user={searchResult}
                  onRegister={handleRegister}
                />

                {searchResult.status === 'Registered' && (
                  <div className="p-4 bg-blue-600 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-blue-200">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6" />
                      <span className="font-bold">Registration Complete</span>
                    </div>
                    <button onClick={() => setHasSearched(false)} className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all">
                      New Search
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-20 rounded-3xl bg-white border border-slate-100 shadow-sm text-center"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <UserX className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No unregistered user found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  We couldn't find any unregistered user matching those details. They may already be in the system or don't exist in the central database.
                </p>
                <button
                  onClick={() => setHasSearched(false)}
                  className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 underline"
                >
                  Reset filters and try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Confirmation Modal Container */}
      {searchResult && (
        <ConfirmRegisterModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          userName={searchResult.name}
          onConfirm={confirmRegistration}
        />
      )}
    </motion.div>
  );
}
