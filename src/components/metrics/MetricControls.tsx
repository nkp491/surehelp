interface MetricControlsProps {
  onIncrement: () => void;
  onDecrement: () => void;
}

const MetricControls = ({ onIncrement, onDecrement }: MetricControlsProps) => {
  return (
    <div className="font-medium text-center text-2xl">
      <button 
        onClick={onIncrement}
        className="hover:text-[rgba(42,111,151,1)] transition-colors"
      >
        +
      </button>
    </div>
  );
};

export default MetricControls;