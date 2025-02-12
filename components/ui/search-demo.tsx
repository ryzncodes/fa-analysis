'use client';

import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { StarBorder } from '@/components/ui/star-border';
import { useRouter } from 'next/navigation';

export function SearchDemo() {
  const router = useRouter();
  const placeholders = [
    'Search for AAPL (Apple Inc.)',
    'Try MSFT (Microsoft Corporation)',
    'Look up GOOGL (Alphabet Inc.)',
    'Find AMZN (Amazon.com Inc.)',
    'Search TSLA (Tesla, Inc.)',
    'Check META (Meta Platforms Inc.)',
    'Explore NVDA (NVIDIA Corporation)',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Optional: Add search suggestions or auto-complete here
    console.log(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input');
    if (input?.value) {
      const ticker = input.value.split(' ')[0].toUpperCase();
      router.push(`/stock/${ticker}`);
    }
  };

  return (
    <StarBorder as='div' className='w-full' speed='8s'>
      <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={handleSubmit} />
    </StarBorder>
  );
}
