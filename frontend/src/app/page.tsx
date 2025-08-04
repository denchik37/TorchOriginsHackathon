import { Header } from '@/components/header';
import { PredictionCard } from '@/components/prediction-card';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <PredictionCard />
        </div>
      </main>
    </div>
  );
}
