import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-6">
      {Icon && (
        <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 mb-4 ring-8 ring-amber-50/50">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-lg font-bold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
