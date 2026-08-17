import React from 'react';

const speciesFallback = (species) => {
  if (species === 'Dog') return '🐶';
  if (species === 'Cat') return '🐱';
  if (species === 'Bird') return '🦜';
  return '🐾';
};

const PetAvatar = ({ pet, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-12 h-12 rounded-2xl text-xl',
    md: 'w-14 h-14 rounded-2xl text-2xl',
    lg: 'w-20 h-20 rounded-3xl text-4xl',
  };

  const sizeClass = sizes[size] || sizes.md;

  if (pet?.avatar_url) {
    return (
      <img
        src={pet.avatar_url}
        alt={`${pet.name} profile`}
        className={`${sizeClass} object-cover border border-slate-200 bg-slate-100 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} bg-teal-100 text-teal-900 flex items-center justify-center font-bold shadow-inner ${className}`}>
      {speciesFallback(pet?.species)}
    </div>
  );
};

export default PetAvatar;
