import {
  AlertCircle,
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  PackageCheck,
  Receipt,
} from 'lucide-react';
import React from 'react';

const ORDER_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Receipt },
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'In the Kitchen', icon: ChefHat },
  { key: 'READY', label: 'Ready for Service', icon: PackageCheck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
  { key: 'DELIVERED', label: 'Delivered / Served', icon: CheckCircle2 },
];

const OrderTimeline = ({ currentStatus, orderType = 'DINE_IN' }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-rose-900">Order Cancelled</h4>
        <p className="text-xs text-rose-700 mt-1">
          This order was cancelled. Any processed payment will be refunded according to our policy.
        </p>
      </div>
    );
  }

  // Filter steps: if Dine-in or Takeaway, omit OUT_FOR_DELIVERY
  const steps = orderType === 'DELIVERY'
    ? ORDER_STEPS
    : ORDER_STEPS.filter((s) => s.key !== 'OUT_FOR_DELIVERY');

  const currentIndex = steps.findIndex((s) => s.key === currentStatus);
  const activeStepIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="py-6 px-2">
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-5 left-6 h-0.5 bg-amber-500 transition-all duration-500 -z-0"
          style={{
            width: `${(activeStepIdx / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Step Nodes */}
        <div className="flex justify-between items-start relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;

            return (
              <div key={step.key} className="flex flex-col items-center max-w-[100px] text-center">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-900 ring-4 ring-amber-100 shadow-lg animate-pulse'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] mt-2.5 font-bold leading-tight ${
                    isCurrent
                      ? 'text-amber-600'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
