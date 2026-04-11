import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CardMetadata from './CardMetadata';

describe('CardMetadata', () => {
  const mockCard = {
    name: 'Test Card',
    type_line: 'Creature — Human Soldier',
    oracle_text: 'Vigilance\nWhen this enters, do something.',
    rarity: 'rare',
  };

  it('renders card type, oracle text, and rarity', () => {
    render(<CardMetadata card={mockCard} />);
    
    expect(screen.getByText('Creature — Human Soldier')).toBeInTheDocument();
    expect(screen.getByText(/Vigilance/)).toBeInTheDocument();
    expect(screen.getByText(/When this enters/)).toBeInTheDocument();
    expect(screen.getByText('rare')).toBeInTheDocument();
  });

  it('applies correct color for rarity', () => {
    const { rerender } = render(<CardMetadata card={{ ...mockCard, rarity: 'common' }} />);
    expect(screen.getByText('common')).toHaveClass('text-gray-400'); 

    rerender(<CardMetadata card={{ ...mockCard, rarity: 'uncommon' }} />);
    expect(screen.getByText('uncommon')).toHaveClass('text-gray-300'); 

    rerender(<CardMetadata card={{ ...mockCard, rarity: 'rare' }} />);
    expect(screen.getByText('rare')).toHaveClass('text-yellow-400'); 

    rerender(<CardMetadata card={{ ...mockCard, rarity: 'mythic' }} />);
    expect(screen.getByText('mythic')).toHaveClass('text-orange-500');
  });
});
