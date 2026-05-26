import { createClient as createServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: todos } = await supabase.from('todos').select();

  return (
    <ul className="space-y-2">
      {todos?.map((todo) => (
        <li key={todo.id} className="p-2 rounded bg-white/5 backdrop-blur-sm shadow">
          {todo.name}
        </li>
      ))}
    </ul>
  );
}
