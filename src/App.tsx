/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/Navbar';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';
import { KanbanView } from './components/KanbanView';
import { ToastContainer } from './components/ToastContainer';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { currentView } = useAttendance();

  return (
    <main className="flex-1 pb-16">
      <AnimatePresence mode="wait">
        {currentView === 'employee' ? (
          <motion.div
            key="employee-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <EmployeeView />
          </motion.div>
        ) : currentView === 'admin' ? (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <AdminView />
          </motion.div>
        ) : (
          <motion.div
            key="kanban-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <KanbanView />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <div className="min-h-screen bg-[#F7F6F2] text-[#4A4941] flex flex-col font-sans antialiased selection:bg-[#6B705C] selection:text-white">
        <Navbar />
        <MainContent />
        <ToastContainer />
      </div>
    </AttendanceProvider>
  );
}
