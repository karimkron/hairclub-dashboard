import React from 'react';

interface CartAnimationProps {
  isActive: boolean;
  productImageSrc: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

const CartAnimation: React.FC<CartAnimationProps> = ({ 
  isActive, 
  productImageSrc, 
  startPosition, 
  endPosition, 
  onComplete 
}) => {
  if (!isActive) return null;
  
  // Calculate animation values using start and end positions
  const xDiff = endPosition.x - startPosition.x;
  const yDiff = endPosition.y - startPosition.y;
  
  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{
        left: startPosition.x,
        top: startPosition.y,
        transform: "translate(-50%, -50%)"
      }}
      onAnimationEnd={onComplete}
    >
      <img 
        src={productImageSrc} 
        alt="Product" 
        className="w-16 h-16 object-cover rounded-lg shadow-md"
        style={{
          animation: 'flyToCartWithShrink 0.7s cubic-bezier(0.65, 0, 0.35, 1) forwards'
        }}
      />
      
      <style>{`
        @keyframes flyToCartWithShrink {
          0% {
            transform: scale(1) translate(0, 0);
            opacity: 1;
          }
          75% {
            opacity: 0.7;
            transform: scale(0.5) translate(${xDiff/0.5 * 0.75}px, ${yDiff/0.5 * 0.75}px);
          }
          100% {
            transform: scale(0.2) translate(${xDiff/0.2}px, ${yDiff/0.2}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CartAnimation;