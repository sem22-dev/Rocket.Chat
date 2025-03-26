
import { Field, FieldGroup, TextInput, FieldLabel, FieldRow, Box } from '@rocket.chat/fuselage';
import { useEffect, useId } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import GenericModal from '../../../../components/GenericModal';

type AddScheduleComposerActionModalProps = {
  onConfirm: (scheduleTime: string) => void;
  onClose: () => void;
};

const AddScheduleComposerActionModal = ({ onClose, onConfirm }: AddScheduleComposerActionModalProps) => {
  const { t } = useTranslation();
  const scheduleField = useId();

  const { handleSubmit, setFocus, control } = useForm({
    mode: 'onBlur',
    defaultValues: {
      scheduleTime: '',
    },
  });

  useEffect(() => {
    setFocus('scheduleTime');
  }, [setFocus]);

  const onClickConfirm = ({ scheduleTime }: { scheduleTime: string }) => {
    onConfirm(scheduleTime);
  };

  const submit = handleSubmit(onClickConfirm);

  return (
    <GenericModal
      variant="warning"
      icon={null}
      confirmText={t('Schedule')}
      onCancel={onClose}
      wrapperFunction={(props) => <Box is="form" onSubmit={(e) => void submit(e)} {...props} />}
      title={t('Schedule_Message')}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={scheduleField}>{t('Schedule Date and Time')}</FieldLabel>
          <FieldRow>
            <Controller
              control={control}
              name="scheduleTime"
              render={({ field }) => <TextInput type="datetime-local" autoComplete="off" id={scheduleField} {...field} />}
            />
          </FieldRow>
        </Field>
      </FieldGroup>
    </GenericModal>
  );
};

export default AddScheduleComposerActionModal;