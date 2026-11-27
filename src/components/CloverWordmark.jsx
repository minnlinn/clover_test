import wordmark from '../assets/clover-wordmark.png';

export default function CloverWordmark({ className = '' }) {
  return <img className={`clover-wordmark ${className}`.trim()} src={wordmark} width={1100} height={352} alt="Clover" />;
}
