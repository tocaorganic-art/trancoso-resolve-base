import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function FavoriteButton({ id, type, name, category }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
    });
  }, []);

  const { data: isFavorited } = useQuery({
    queryKey: ['favorite', id, user?.email],
    queryFn: async () => {
      if (!user?.email) return false;
      const favs = await base44.entities.Favorite.filter({
        user_email: user.email,
        [type === 'service' ? 'service_id' : 'provider_id']: id
      });
      return favs.length > 0;
    },
    enabled: !!user?.email,
    staleTime: Infinity
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) return;
      
      if (isFavorited) {
        const favs = await base44.entities.Favorite.filter({
          user_email: user.email,
          [type === 'service' ? 'service_id' : 'provider_id']: id
        });
        if (favs.length > 0) {
          await base44.entities.Favorite.delete(favs[0].id);
        }
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          [type === 'service' ? 'service_id' : 'provider_id']: id,
          type,
          category,
          name
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', id, user?.email] });
    }
  });

  if (!user) return null;

  return (
    <button
      onClick={() => toggleMutation.mutate()}
      disabled={toggleMutation.isPending}
      className="p-2 rounded-full hover:bg-slate-700 transition-all"
      aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isFavorited
            ? 'fill-red-500 text-red-500'
            : 'text-slate-400 hover:text-red-400'
        }`}
      />
    </button>
  );
}