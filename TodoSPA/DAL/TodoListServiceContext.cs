using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TodoSPA.Models;

namespace TodoSPA.DAL
{
    public class TodoListServiceContext : DbContext
    {
        public TodoListServiceContext()
            : base("TodoListServiceContext")
        { }
        public DbSet<Todo> Todoes { get; set; }
    }
}
