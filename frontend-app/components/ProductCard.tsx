'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore, type Product } from '@/store/useStore';
import { productAPI } from '@/lib/api';
import styles from './Card.module.css';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { deleteProduct } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setIsDeleting(true);
      await productAPI.delete(product.id);
      deleteProduct(product.id);
      useStore.getState().addToast('Product deleted successfully', 'success');
    } catch (err: any) {
      useStore.getState().addToast(err.response?.data?.message || 'Failed to delete product', 'error');
      console.error('Error deleting product:', err);
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
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-purple-600">
          ${product.price.toFixed(2)}
        </div>
        <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
          Stock: {product.stock}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </motion.button>
    </motion.div>
  );
}
