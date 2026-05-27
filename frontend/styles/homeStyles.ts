import { StyleSheet } from 'react-native';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '@/constants/theme';

export const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundGradientEnd,
  },

  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },

  chipContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  chipScroll: {
    flexGrow: 0,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  outfitGrid: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Loading
  loadingContainer: {
    flex: 1,
  },

  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 20,
  },

  loadingSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },

  modalImage: {
    width: '100%',
    height: 420,
  },

  modalContent: {
    padding: 22,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },

  modalCategory: {
    fontSize: 16,
    color: '#777',
    marginTop: 6,
    marginBottom: 24,
  },

  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 14,
  },

  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  closeButton: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },

});