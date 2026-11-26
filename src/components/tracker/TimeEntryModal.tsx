import { TimeEntry } from '../../types';
import { DialogModal } from '../ui/DialogModal';
import { TimeEntryForm } from './TimeEntryForm';

interface TimeEntryModalProps {
  open: boolean;
  onClose: () => void;
  initialEntry?: TimeEntry | null;
  defaultDate?: string;
}

export function TimeEntryModal({
  open,
  onClose,
  initialEntry,
  defaultDate,
}: TimeEntryModalProps) {
  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title={initialEntry ? 'Edit time entry' : 'Log time'}
      subtitle={
        initialEntry
          ? 'Update your recorded session details.'
          : 'Record focused work, learning, personal time, or breaks.'
      }
    >
      <TimeEntryForm
        initialEntry={initialEntry}
        defaultDate={defaultDate}
        onCancel={onClose}
        onSuccess={() => {
          onClose();
        }}
      />
    </DialogModal>
  );
}
