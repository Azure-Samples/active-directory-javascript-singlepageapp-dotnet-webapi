using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoSPA.Models
{
    public class Todo
    {
        public int ID { get; set; }
        public string Description { get; set; }
        public string Owner { get; set; }
    }
}
