using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using Api_Open_Service.Models;

namespace Api_Open_Service.Data.Repositories

{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly OpenServiceDbContext _context;
        internal DbSet<T> dbSet;

        public Repository(OpenServiceDbContext context)
        {
            _context = context;
            this.dbSet = _context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(T entity)
        {
            await dbSet.AddAsync(entity);
        }

        public void Update(T entity)
        {
            dbSet.Update(entity);
        }

        public void Remove(T entity)
        {
            dbSet.Remove(entity);
        }
    }
}
