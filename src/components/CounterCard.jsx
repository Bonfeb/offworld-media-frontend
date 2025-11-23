import { counterAnimation } from "../hooks/counterAnimation";

export const CounterCard = ({
  targetValue,
  suffix = "",
  prefix = "",
  duration = 2000,
  autoRestart = false,
  shouldStart = true,
  description,

  className = "p-8 bg-muted-50 rounded-2xl text-center",
  counterClassName = "text-4xl font-bold text-muted-700 mb-2",
  descriptionClassName = "text-muted-700 text-sm",
}) => {
  const { count } = counterAnimation(targetValue, {
    duration,
    autoRestart,
    shouldStart,
  });

  return (
    <div className={className}>
      <p className={counterClassName}>
        {prefix}
        {count}
        {suffix}
      </p>
      <p className={descriptionClassName}>{description}</p>
    </div>
  );
};
