import type { Answers, ContactInfoValue, Question } from './types';
import ShortText from './inputs/ShortText';
import LongText from './inputs/LongText';
import CardSelect from './inputs/CardSelect';
import MultiCardSelect from './inputs/MultiCardSelect';
import Segmented from './inputs/Segmented';
import Slider from './inputs/Slider';
import ContactInfo from './inputs/ContactInfo';
import { emptyContact } from './inputs/contactDefaults';

type Props = {
  question: Question;
  answers: Answers;
  onChange: (id: string, value: Answers[string]) => void;
  autoFocus?: boolean;
};

export default function QuestionRenderer({ question, answers, onChange, autoFocus }: Props) {
  const value = answers[question.id];

  switch (question.kind) {
    case 'short-text':
      return (
        <ShortText
          id={question.id}
          label={question.label}
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(question.id, v)}
          placeholder={question.placeholder}
          helpText={question.helpText}
          required={question.required}
          maxLength={question.maxLength}
          autoFocus={autoFocus}
        />
      );

    case 'long-text':
      return (
        <LongText
          id={question.id}
          label={question.label}
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(question.id, v)}
          placeholder={question.placeholder}
          helpText={question.helpText}
          required={question.required}
          rows={question.rows}
          maxLength={question.maxLength}
          autoFocus={autoFocus}
        />
      );

    case 'single-card':
      return (
        <CardSelect
          id={question.id}
          label={question.label}
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(question.id, v)}
          options={question.options}
          helpText={question.helpText}
          required={question.required}
        />
      );

    case 'multi-card':
      return (
        <MultiCardSelect
          id={question.id}
          label={question.label}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(v) => onChange(question.id, v)}
          options={question.options}
          helpText={question.helpText}
          required={question.required}
          maxSelections={question.maxSelections}
        />
      );

    case 'segmented':
      return (
        <Segmented
          id={question.id}
          label={question.label}
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(question.id, v)}
          options={question.options}
          helpText={question.helpText}
          required={question.required}
        />
      );

    case 'slider':
      return (
        <Slider
          id={question.id}
          label={question.label}
          value={typeof value === 'number' ? value : question.min}
          onChange={(v) => onChange(question.id, v)}
          min={question.min}
          max={question.max}
          step={question.step}
          formatValue={question.formatValue}
          quickPicks={question.quickPicks}
          helpText={question.helpText}
          required={question.required}
        />
      );

    case 'contact-info': {
      const current = (value && typeof value === 'object' && !Array.isArray(value)
        ? (value as ContactInfoValue)
        : emptyContact);
      return <ContactInfo id={question.id} value={current} onChange={(v) => onChange(question.id, v)} />;
    }
  }
}
