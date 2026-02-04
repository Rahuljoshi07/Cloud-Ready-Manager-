'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore, type User } from '@/store/useStore';
import { userAPI } from '@/lib/api';
import styles from './Card.module.css';

interface UserCardProps {
  user: User;
  index: number;
}

export default function UserCard({ user, index }: UserCardProps) {
  const { deleteUser } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setIsDeleting(true);
      await userAPI.delete(user.id);
      deleteUser(user.id);
      useStore.getState().addToast('User deleted successfully', 'success');
    } catch (err: any) {
      useStore.getState().addToast(err.response?.data?.message || 'Failed to delete user', 'error');
      console.error('Error deleting user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={styles.card}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      {user.age && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            Age: {user.age}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </motion.button>
      </div>
    </motion.div>
  );
}
