import { useState, useEffect } from 'react';
import { getMemes } from '../services/api';
import MemeCard from '../components/MemeCard';
import toast from 'react-hot-toast';

const FeedPage = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const data = await getMemes();
      setMemes(data);
    } catch (error) {
      toast.error('Failed to load memes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Loading memes...</div>;
  }

  return (
    <div className="pb-16">
      {memes.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No memes yet. Be the first to upload!
        </p>
      ) : (
        memes.map((meme) => (
          <MemeCard key={meme._id} meme={meme} showDelete={false} />
        ))
      )}
    </div>
  );
};

export default FeedPage;