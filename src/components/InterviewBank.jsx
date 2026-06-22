import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Star, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Shuffle, Filter, Bookmark, X, RefreshCw } from 'lucide-react';

const QUESTIONS = [
  // ----- PYTHON -----
  { id: 1, topic: "Python", difficulty: "Easy", question: "What is the difference between a list and a tuple in Python?", answer: "Lists are mutable (can be changed) while tuples are immutable (cannot be changed). Lists use square brackets [] and tuples use parentheses (). Tuples are faster and use less memory. Use tuples for fixed data and lists for data that needs modification." },
  { id: 2, topic: "Python", difficulty: "Easy", question: "What is a decorator in Python?", answer: "A decorator is a function that takes another function as input and extends its behavior without modifying it. Used with @symbol. Common examples: @staticmethod, @classmethod, @property. Used for logging, authentication, caching." },
  { id: 3, topic: "Python", difficulty: "Easy", question: "Explain list comprehension in Python.", answer: "List comprehension is a concise way to create lists. Syntax: [expression for item in iterable if condition]. Example: squares = [x**2 for x in range(10)]. Faster than regular for loops and more readable." },
  { id: 4, topic: "Python", difficulty: "Medium", question: "What is the difference between deep copy and shallow copy in Python?", answer: "Shallow copy creates a new object but inserts references to the original nested objects. Deep copy creates a new object and recursively copies all nested objects. Shallow copy is faster but changes to nested objects affect both. Use copy.copy() for shallow, copy.deepcopy() for deep." },
  { id: 5, topic: "Python", difficulty: "Medium", question: "What is the Global Interpreter Lock (GIL) in Python?", answer: "GIL is a mutex that allows only one thread to execute Python bytecode at a time. It simplifies memory management but limits true parallel execution. Use multiprocessing for CPU-bound tasks, threading for I/O-bound tasks. Libraries like NumPy release the GIL during heavy operations." },
  { id: 6, topic: "Python", difficulty: "Medium", question: "How does garbage collection work in Python?", answer: "Python uses reference counting and generational garbage collection. Each object has a reference count; when it reaches zero, memory is freed. The gc module handles cyclic references. Generational collection divides objects into generations (0, 1, 2) based on age, scanning younger generations more frequently." },
  { id: 7, topic: "Python", difficulty: "Hard", question: "What is the difference between @classmethod, @staticmethod, and instance methods?", answer: "Instance methods take self as first param and can access/modify instance state. @classmethod takes cls as first param and can access/modify class state. @staticmethod takes no implicit first param — it's like a regular function but belongs to the class namespace. Use classmethod for alternative constructors, staticmethod for utility functions." },
  { id: 8, topic: "Python", difficulty: "Hard", question: "Explain Python's descriptor protocol with __get__ and __set__.", answer: "Descriptors are objects that define __get__, __set__, or __delete__ methods, controlling attribute access. When an attribute is accessed, Python checks if the attribute object has __get__ — if so, it's a descriptor. Properties, methods, and @classmethod are implemented using descriptors. Data descriptors (with __set__) take priority over instance dictionaries." },
  { id: 9, topic: "Python", difficulty: "Easy", question: "What are *args and **kwargs in Python?", answer: "*args allows passing a variable number of positional arguments (packed into a tuple). **kwargs allows passing a variable number of keyword arguments (packed into a dict). Used in function definitions and when wrapping functions. The names args and kwargs are convention but the * and ** syntax is required." },
  { id: 10, topic: "Python", difficulty: "Medium", question: "What is the difference between __str__ and __repr__?", answer: "__repr__ aims to be unambiguous — used for debugging and should return a string that could recreate the object. __str__ aims to be readable — used for display to end users. If __str__ is missing, Python falls back to __repr__. By convention, __repr__ should be informative and __str__ should be human-friendly." },
  { id: 11, topic: "Python", difficulty: "Hard", question: "How do you manage memory in Python with generators vs lists?", answer: "Generators produce items lazily, yielding one at a time using yield keyword. They use O(1) memory vs O(n) for lists. Lists store all values in memory at once. Generators are ideal for large datasets, infinite sequences, or streaming data. Tradeoff: generators can only be iterated once and have no random access." },
  { id: 12, topic: "Python", difficulty: "Easy", question: "What is the difference between is and == in Python?", answer: "== checks value equality — whether two objects have the same value. 'is' checks identity equality — whether two variables point to the same object in memory. Example: [1, 2] == [1, 2] is True but [1, 2] is [1, 2] is False. Use 'is' for comparing to None: if x is None." },

  // ----- JAVA -----
  { id: 13, topic: "Java", difficulty: "Easy", question: "What is the difference between JDK, JRE, and JVM?", answer: "JVM (Java Virtual Machine) runs Java bytecode. JRE (Java Runtime Environment) includes JVM + core libraries for running Java apps. JDK (Java Development Kit) includes JRE + development tools like compiler and debugger. JDK is for development, JRE for running, JVM is the execution engine." },
  { id: 14, topic: "Java", difficulty: "Easy", question: "What is the difference between abstract class and interface in Java?", answer: "Abstract classes can have both abstract and concrete methods, can have constructors and instance variables. Interfaces (pre-Java 8) only had abstract methods; Java 8+ allows default and static methods. A class can extend only one abstract class but implement multiple interfaces. Use abstract class for related classes, interface for capabilities." },
  { id: 15, topic: "Java", difficulty: "Medium", question: "What is the difference between method overloading and method overriding?", answer: "Overloading occurs within the same class with different parameters (compile-time polymorphism). Overriding occurs in a subclass with same signature (runtime polymorphism). Overloaded methods must differ in parameter list. Overridden methods must have same signature and cannot be less accessible. Overriding uses @Override annotation." },
  { id: 16, topic: "Java", difficulty: "Medium", question: "What is the difference between HashMap and ConcurrentHashMap?", answer: "HashMap is not thread-safe — multiple threads can corrupt it. ConcurrentHashMap is thread-safe and allows concurrent reads/writes by dividing the map into segments. HashMap allows null keys/values, ConcurrentHashMap does not. ConcurrentHashMap performs better than synchronizing HashMap externally for multi-threaded scenarios." },
  { id: 17, topic: "Java", difficulty: "Hard", question: "Explain the Java memory model and garbage collection.", answer: "Java heap is divided into Young Generation (Eden + Survivor spaces), Old Generation, and Metaspace. GC starts with minor collection in Young Gen using stop-the-world. Objects surviving multiple cycles promote to Old Gen. Major GC cleans Old Gen. Types: Serial, Parallel, CMS, G1GC. G1 is default since Java 9, balancing throughput and pause times." },
  { id: 18, topic: "Java", difficulty: "Easy", question: "What are the four pillars of OOP in Java?", answer: "Encapsulation: hiding data using private fields and public getters/setters. Inheritance: deriving new classes from existing ones using extends. Polymorphism: same interface different implementations via overriding. Abstraction: hiding complex implementation details using abstract classes and interfaces." },
  { id: 19, topic: "Java", difficulty: "Medium", question: "What is the difference between final, finally, and finalize?", answer: "final is a keyword for declaring constants, preventing inheritance or overriding. finally is a block in try-catch that always executes for cleanup. finalize is a method called by GC before reclaiming an object's memory (deprecated since Java 9). They have nothing in common except similar spelling." },
  { id: 20, topic: "Java", difficulty: "Medium", question: "What is the difference between ArrayList and LinkedList?", answer: "ArrayList uses a dynamic array — O(1) random access, O(n) insertion/deletion from middle. LinkedList uses doubly-linked list — O(n) random access, O(1) insertion/deletion at ends. ArrayList uses less memory per element. LinkedList is better for frequent insertions/deletions, ArrayList for frequent reads." },
  { id: 21, topic: "Java", difficulty: "Hard", question: "Explain the concept of Java Streams and how they differ from collections.", answer: "Streams process sequences of data using functional operations like map, filter, reduce. Unlike collections, streams don't store data — they carry it from source through a pipeline. Streams are lazy (intermediate operations don't execute until terminal op). Can be sequential or parallel. Once consumed, a stream cannot be reused." },
  { id: 22, topic: "Java", difficulty: "Easy", question: "What is a constructor in Java?", answer: "A constructor is a special method that initializes objects when created. It has the same name as the class and no return type. Java provides a default no-arg constructor if none defined. Constructors can be overloaded. Use this() to call another constructor in same class, super() to call parent constructor." },

  // ----- JAVASCRIPT -----
  { id: 23, topic: "JavaScript", difficulty: "Easy", question: "What is the difference between == and === in JavaScript?", answer: "== checks value only (loose equality) with type coercion. === checks both value AND type (strict equality). Example: 0 == false is true, but 0 === false is false. Always prefer === to avoid unexpected bugs." },
  { id: 24, topic: "JavaScript", difficulty: "Medium", question: "What is closure in JavaScript?", answer: "A closure is a function that has access to variables from its outer scope even after the outer function has returned. Used for data privacy, factory functions, and callbacks. Example: counter functions that remember their count. Closures are created every time a function is created." },
  { id: 25, topic: "JavaScript", difficulty: "Easy", question: "What is the difference between var, let and const?", answer: "var is function-scoped and hoisted to top. let is block-scoped and not hoisted. const is block-scoped, not hoisted, and cannot be reassigned (but object properties can change). Always prefer const, use let when reassignment needed, avoid var entirely." },
  { id: 26, topic: "JavaScript", difficulty: "Medium", question: "What is event delegation in JavaScript?", answer: "Event delegation attaches a single event listener to a parent element to handle events for multiple children using event bubbling. Instead of adding listeners to each child, the parent captures events and checks event.target. More efficient, works for dynamically added elements. Common with lists and tables." },
  { id: 27, topic: "JavaScript", difficulty: "Medium", question: "What is the difference between call(), apply(), and bind()?", answer: "call() invokes a function with given this and arguments passed individually. apply() invokes a function with given this and arguments as an array. bind() returns a new function with this bound permanently, without invoking it. call and apply are for immediate execution, bind for later." },
  { id: 28, topic: "JavaScript", difficulty: "Hard", question: "How does the event loop work in JavaScript?", answer: "JS is single-threaded. The event loop continuously checks the call stack and callback queue. When stack is empty, it pushes first callback from the queue. Microtasks (Promise callbacks) have priority over macrotasks (setTimeout, DOM events). The event loop enables non-blocking async operations despite single threading." },
  { id: 29, topic: "JavaScript", difficulty: "Hard", question: "What is the difference between Promise.all, Promise.race, and Promise.allSettled?", answer: "Promise.all resolves when all promises resolve, rejects immediately if any rejects. Promise.race resolves/rejects as soon as first promise settles. Promise.allSettled resolves when all settle, returning array of {status, value/reason}. all fails fast, race gets first, allSettled waits for all regardless of outcome." },
  { id: 30, topic: "JavaScript", difficulty: "Easy", question: "What is the difference between null and undefined?", answer: "undefined means a variable has been declared but not assigned a value. null is an intentional assignment meaning 'no value'. typeof null returns 'object' (a JS bug). null === undefined is false, null == undefined is true. Use null when you want to explicitly clear a variable." },
  { id: 31, topic: "JavaScript", difficulty: "Medium", question: "What is hoisting in JavaScript?", answer: "Hoisting moves variable and function declarations to the top of their scope before code execution. var declarations are hoisted and initialized as undefined. let/const are hoisted but not initialized (Temporal Dead Zone). Function declarations are hoisted entirely. Function expressions are not hoisted." },
  { id: 32, topic: "JavaScript", difficulty: "Hard", question: "Explain the concept of currying in JavaScript.", answer: "Currying transforms a function with multiple arguments into a sequence of functions each taking one argument. Example: const add = a => b => a + b; add(1)(2) returns 3. Enables partial application and function composition. Useful for creating specialized functions from general ones and improving code reusability." },

  // ----- REACT -----
  { id: 33, topic: "React", difficulty: "Easy", question: "What is the difference between state and props?", answer: "Props are read-only data passed from parent to child component. State is mutable data managed within a component. Props cannot be modified by the child. State changes trigger re-renders. Use props for configuration, state for dynamic data." },
  { id: 34, topic: "React", difficulty: "Easy", question: "What are React hooks?", answer: "Hooks are functions that let you use state and lifecycle features in functional components. Common hooks: useState (manage state), useEffect (side effects), useContext (context API), useRef (DOM references), useMemo (memoization). Hooks cannot be called conditionally or inside loops." },
  { id: 35, topic: "React", difficulty: "Medium", question: "What is virtual DOM in React?", answer: "Virtual DOM is a lightweight copy of the real DOM kept in memory. When state changes, React creates a new virtual DOM, compares it with old one (diffing via reconciliation), and updates only changed parts in real DOM (commit phase). This batch update strategy makes React fast by minimizing expensive real DOM operations." },
  { id: 36, topic: "React", difficulty: "Medium", question: "What is the useEffect cleanup function and when is it used?", answer: "useEffect can return a cleanup function that runs when the component unmounts or dependencies change. Used for unsubscribing from event listeners, clearing timers, canceling API requests, closing WebSocket connections. Prevents memory leaks. Runs before the effect re-runs and on unmount." },
  { id: 37, topic: "React", difficulty: "Medium", question: "What is the difference between useMemo and useCallback?", answer: "useMemo memoizes a computed value, returning the cached result unless dependencies change. useCallback memoizes a function reference, preventing unnecessary re-renders of child components. useMemo(() => compute(a, b), [a, b]) vs useCallback(() => fn(a, b), [a, b]). Both optimize performance by avoiding unnecessary recalculations." },
  { id: 38, topic: "React", difficulty: "Hard", question: "How does React handle reconciliation and keying?", answer: "Reconciliation is React's algorithm for comparing virtual DOM trees. It assumes elements of different types produce different trees. Keys help identify which children changed, are added, or removed. Using stable keys (unique IDs) enables O(n) complexity. Using indexes as keys can cause bugs with list reordering." },
  { id: 39, topic: "React", difficulty: "Easy", question: "What is the difference between controlled and uncontrolled components?", answer: "Controlled components manage form data via React state — the input value is controlled by state and onChange handler updates it. Uncontrolled components store their own internal state in the DOM — use refs to access values. Controlled gives more control and validation, uncontrolled is simpler for basic forms." },
  { id: 40, topic: "React", difficulty: "Medium", question: "What is context API and when would you use it?", answer: "Context API provides a way to share values across the component tree without prop drilling. Create context with createContext, provide value with Provider, consume with useContext hook or Consumer component. Use for themes, auth, locale, user preferences. For complex state, consider Redux or Zustand instead." },
  { id: 41, topic: "React", difficulty: "Hard", question: "What are React Portals and what problem do they solve?", answer: "Portals render children into a DOM node outside the parent component's DOM hierarchy using createPortal. Useful for modals, tooltips, dropdowns that need to break out of overflow:hidden or z-index contexts. Portals retain React context and event bubbling works across portal boundaries." },
  { id: 42, topic: "React", difficulty: "Hard", question: "Explain how React's Fiber architecture works.", answer: "Fiber is React 16's new reconciliation engine that enables incremental rendering. It breaks rendering work into units (fibers) that can be paused, resumed, or aborted. Each fiber represents a component with its work queue. Enables concurrent mode, suspense, and prioritization of urgent updates over background ones." },

  // ----- SQL -----
  { id: 43, topic: "SQL", difficulty: "Easy", question: "What is the difference between INNER JOIN and LEFT JOIN?", answer: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from left table and matching rows from right table (NULL for non-matches). Use INNER JOIN when you need only matching data, LEFT JOIN when you need all left table records." },
  { id: 44, topic: "SQL", difficulty: "Medium", question: "What is indexing in SQL?", answer: "Indexing creates a data structure that improves query speed. Like a book index, it helps find data without scanning every row. Types: Primary index, Unique index, Composite index, Full-text index. Speeds up SELECT but slows INSERT/UPDATE. Use on frequently searched columns. B-tree indexes are most common." },
  { id: 45, topic: "SQL", difficulty: "Easy", question: "What is the difference between WHERE and HAVING clauses?", answer: "WHERE filters rows before grouping (GROUP BY). HAVING filters groups after aggregation. WHERE cannot use aggregate functions like COUNT, SUM, AVG. HAVING can use aggregate functions. Both can be used together in a query. Example: WHERE salary > 50000 GROUP BY dept HAVING COUNT(*) > 5." },
  { id: 46, topic: "SQL", difficulty: "Medium", question: "What are the different normal forms in database normalization?", answer: "1NF: each column has atomic values, no repeating groups. 2NF: in 1NF + all non-key columns fully dependent on primary key. 3NF: in 2NF + no transitive dependencies (non-key depends on another non-key). BCNF: stronger version of 3NF. Higher normal forms reduce redundancy but may impact query performance." },
  { id: 47, topic: "SQL", difficulty: "Hard", question: "What is the difference between clustered and non-clustered indexes?", answer: "Clustered index determines physical order of data rows — a table can have only one. Non-clustered index stores a separate structure with pointers to data rows — a table can have multiple. Clustered indexes are faster for range queries but slower for inserts. Non-clustered indexes need lookups to retrieve actual data." },
  { id: 48, topic: "SQL", difficulty: "Medium", question: "What are ACID properties in databases?", answer: "Atomicity: transactions complete fully or not at all. Consistency: data follows all rules and constraints. Isolation: concurrent transactions don't interfere with each other. Durability: committed changes persist even after system failure. These properties ensure reliable database transactions, especially in financial systems." },
  { id: 49, topic: "SQL", difficulty: "Easy", question: "What is a primary key vs foreign key?", answer: "Primary key uniquely identifies each row in a table — must be unique and NOT NULL. Foreign key is a column referencing a primary key in another table, establishing a relationship. Primary keys enforce entity integrity, foreign keys enforce referential integrity. A table can have only one primary key but multiple foreign keys." },
  { id: 50, topic: "SQL", difficulty: "Hard", question: "Explain query execution plan and how to optimize a slow query.", answer: "Execution plan shows how the database processes a query (table scans, index usage, join methods). To optimize: use EXPLAIN ANALYZE, add appropriate indexes, avoid SELECT *, rewrite subqueries as JOINs, avoid functions in WHERE clauses, use LIMIT, partition large tables, update statistics." },
  { id: 51, topic: "SQL", difficulty: "Medium", question: "What is the difference between DELETE, TRUNCATE, and DROP?", answer: "DELETE removes rows one by one, can have WHERE clause, triggers fire, can be rolled back. TRUNCATE removes all rows deallocating data pages, cannot use WHERE, faster than DELETE, minimal logging. DROP removes the entire table structure including data and schema — irreversible. TRUNCATE resets identity columns, DELETE does not." },
  { id: 52, topic: "SQL", difficulty: "Easy", question: "What is a subquery and what are correlated subqueries?", answer: "A subquery is a query nested inside another query. Correlated subqueries reference columns from the outer query and execute once per outer row. Non-correlated subqueries execute once then the result is used by outer query. Correlated subqueries can be slow for large datasets." },

  // ----- DATA STRUCTURES -----
  { id: 53, topic: "Data Structures", difficulty: "Easy", question: "What is the difference between Stack and Queue?", answer: "Stack follows LIFO (Last In First Out) — like a stack of plates. Queue follows FIFO (First In First Out) — like a queue of people. Stack operations: push, pop, peek. Queue operations: enqueue, dequeue, front. Stack used in recursion and undo operations, Queue in BFS and print spooling." },
  { id: 54, topic: "Data Structures", difficulty: "Easy", question: "What is Big O notation?", answer: "Big O notation describes algorithm efficiency in worst case. O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2^n) exponential. Used to compare algorithm performance independent of hardware. Focuses on growth rate as input size increases." },
  { id: 55, topic: "Data Structures", difficulty: "Medium", question: "What is the difference between binary search and linear search?", answer: "Linear search checks each element sequentially — O(n) time, works on unsorted data. Binary search repeatedly divides the search space in half — O(log n) time, requires sorted data. Linear search is simpler but much slower for large datasets. Binary search is optimal for sorted arrays." },
  { id: 56, topic: "Data Structures", difficulty: "Medium", question: "What is a hash table and how does it handle collisions?", answer: "A hash table stores key-value pairs using a hash function to compute an index. Collisions occur when different keys hash to same index. Handling methods: Chaining (each bucket stores a linked list) and Open Addressing (find next empty slot via probing). Load factor determines when to resize. Average O(1) operations." },
  { id: 57, topic: "Data Structures", difficulty: "Hard", question: "What is the difference between DFS and BFS?", answer: "DFS (Depth-First Search) explores as far as possible along each branch before backtracking — uses stack (or recursion), O(V+E) time. BFS (Breadth-First Search) explores all neighbors at current depth before going deeper — uses queue, O(V+E) time. DFS uses less memory for deep graphs. BFS finds shortest path in unweighted graphs." },
  { id: 58, topic: "Data Structures", difficulty: "Medium", question: "What is the difference between an array and a linked list?", answer: "Arrays have fixed size (or dynamic like ArrayList), O(1) random access, contiguous memory. Linked lists grow dynamically, O(n) random access, non-contiguous memory with pointers. Arrays better for frequent reads, linked lists for frequent inserts/deletes. Linked lists use more memory due to pointer storage." },
  { id: 59, topic: "Data Structures", difficulty: "Hard", question: "Explain dynamic programming and when to use it.", answer: "Dynamic programming solves complex problems by breaking them into overlapping subproblems and storing results to avoid recomputation. Two approaches: top-down (memoization — recursion + cache) and bottom-up (tabulation — iterative). Use when problem has optimal substructure and overlapping subproblems. Examples: Fibonacci, knapSack, LCS." },
  { id: 60, topic: "Data Structures", difficulty: "Easy", question: "What is a binary tree and what are its types?", answer: "A binary tree is a hierarchical structure where each node has at most 2 children (left and right). Types: Full (each node has 0 or 2 children), Complete (all levels filled except possibly last), Perfect (all internal nodes have 2 children and all leaves at same level), BST (left < parent < right), Balanced (height O(log n))." },
  { id: 61, topic: "Data Structures", difficulty: "Medium", question: "What is the difference between min-heap and max-heap?", answer: "Min-heap has smallest element at root, parent <= children. Max-heap has largest element at root, parent >= children. Both are complete binary trees. Used for priority queues, heap sort. Insertion and extraction both O(log n). Heapify builds a heap from array in O(n)." },
  { id: 62, topic: "Data Structures", difficulty: "Hard", question: "Explain the algorithm to detect a cycle in a linked list.", answer: "Floyd's Cycle Detection (tortoise and hare) uses two pointers: slow moves 1 step, fast moves 2 steps. If they meet, a cycle exists. To find the cycle start: reset one pointer to head, move both 1 step until they meet again. Time O(n), space O(1). Alternative: use a hash set but requires O(n) space." },

  // ----- SYSTEM DESIGN -----
  { id: 63, topic: "System Design", difficulty: "Easy", question: "What is the difference between SQL and NoSQL databases?", answer: "SQL databases are relational, use structured tables with schema, support ACID transactions, scale vertically. NoSQL databases are non-relational, flexible schema, scale horizontally, eventual consistency. SQL: MySQL, PostgreSQL. NoSQL: MongoDB (document), Redis (key-value), Cassandra (wide-column). Choose based on data structure and scale needs." },
  { id: 64, topic: "System Design", difficulty: "Easy", question: "What is REST API?", answer: "REST (Representational State Transfer) is an architectural style for APIs. Uses HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove). Stateless — each request contains all needed info. Returns JSON or XML. Uses resource-based URLs like /api/users/123. Idempotent methods: GET, PUT, DELETE." },
  { id: 65, topic: "System Design", difficulty: "Medium", question: "What is load balancing and how does it work?", answer: "Load balancing distributes incoming traffic across multiple servers to prevent any single server from being overwhelmed. Algorithms: Round Robin (cycles through servers), Least Connections (sends to least busy), IP Hash (same client always goes to same server). Can be at Layer 4 (transport) or Layer 7 (application). Improves availability and fault tolerance." },
  { id: 66, topic: "System Design", difficulty: "Medium", question: "What is caching and what are cache eviction policies?", answer: "Caching stores frequently accessed data in fast memory to reduce latency and database load. Eviction policies: LRU (remove least recently used), LFU (remove least frequently used), FIFO (remove oldest), TTL (time-based expiration). Common caches: Redis, Memcached, CDN. Cache aside, read-through, write-through are common strategies." },
  { id: 67, topic: "System Design", difficulty: "Hard", question: "How would you design a URL shortening service like TinyURL?", answer: "API: POST to create short URL, GET to redirect. Generate unique 7-char codes using base62 encoding. Store mapping in DB with expiration. Handle 10K+ writes/sec with sharding by hash. Use Redis cache for hot URLs. Redirect with 301 for permanent, 302 for analytics. Track click analytics asynchronously." },
  { id: 68, topic: "System Design", difficulty: "Medium", question: "What is the difference between horizontal and vertical scaling?", answer: "Vertical scaling adds more power (CPU, RAM) to existing server — simpler but has hardware limits and downtime. Horizontal scaling adds more servers to pool — more complex but theoretically unlimited, better fault tolerance. Horizontal requires load balancers and distributed system design. Modern systems prefer horizontal scaling." },
  { id: 69, topic: "System Design", difficulty: "Hard", question: "Explain the CAP theorem.", answer: "CAP theorem states distributed systems can only guarantee 2 of 3: Consistency (all nodes see same data at same time), Availability (every request gets a response), Partition Tolerance (system continues despite network failures). In practice, networks will partition so systems choose CP (consistency) or AP (availability). Examples: MongoDB is CP, Cassandra is AP." },
  { id: 70, topic: "System Design", difficulty: "Medium", question: "What is message queuing and when do you use it?", answer: "Message queues allow async communication between services via messages. Producer sends messages, consumer processes them. Benefits: decoupling, load leveling, fault tolerance, scalability. Common queues: RabbitMQ, Apache Kafka, AWS SQS. Use for task processing, event-driven architectures, microservices communication." },
  { id: 71, topic: "System Design", difficulty: "Easy", question: "What is microservices architecture?", answer: "Microservices architecture breaks an application into small, independent services that each handle a specific business function. Services communicate via APIs (REST/gRPC) or message queues. Each service can be developed, deployed, and scaled independently. Pros: flexibility, scalability, fault isolation. Cons: complexity, latency, data consistency challenges." },
  { id: 72, topic: "System Design", difficulty: "Hard", question: "How would you design a real-time chat application?", answer: "Use WebSocket for persistent bidirectional connection. Message broker (Kafka/RabbitMQ) for message ordering and delivery. Store messages in time-series DB (Cassandra). Use Redis for online status and typing indicators. Shard by conversation ID. Handle presence with heartbeats. Rate limiting to prevent spam. End-to-end encryption for privacy." },

  // ----- HR & BEHAVIORAL -----
  { id: 73, topic: "HR & Behavioral", difficulty: "Easy", question: "Tell me about yourself.", answer: "Structure: Present (current role/education), Past (relevant experience), Future (why this role). Keep it 2 minutes. Focus on technical skills relevant to job. End with why you are excited about this opportunity. Practice until it flows naturally but don't sound rehearsed." },
  { id: 74, topic: "HR & Behavioral", difficulty: "Easy", question: "Where do you see yourself in 5 years?", answer: "Show ambition but be realistic. Mention skill growth, taking on more responsibilities, contributing to the company. Align with company's direction. Avoid saying 'in your position' or being too specific about titles. Example: 'I want to grow into a senior engineer who mentors others and leads complex projects.'" },
  { id: 75, topic: "HR & Behavioral", difficulty: "Medium", question: "What is your greatest weakness?", answer: "Choose a real weakness you are actively improving. Show self-awareness and growth mindset. Example: 'I used to struggle with time management but now use project management tools and time-blocking which has greatly improved.' Never say 'I work too hard' or 'I'm a perfectionist'." },
  { id: 76, topic: "HR & Behavioral", difficulty: "Easy", question: "Why do you want to work here?", answer: "Research the company first. Mention specific projects, tech stack, company culture, or mission that excites you. Connect it to your career goals. Show you've done homework. Avoid generic answers like 'good company' or 'great opportunities'. Be specific about what makes this company different." },
  { id: 77, topic: "HR & Behavioral", difficulty: "Medium", question: "Tell me about a time you faced a conflict at work.", answer: "Use STAR method: Situation (set context), Task (your responsibility), Action (specific steps you took), Result (positive outcome). Show emotional intelligence and problem-solving skills. Example: conflicting priorities with a teammate — how you communicated and found compromise leading to successful project delivery." },
  { id: 78, topic: "HR & Behavioral", difficulty: "Hard", question: "Describe a time you failed and what you learned.", answer: "Choose a real failure, not a 'humble brag'. Explain what went wrong, your accountability, and specific lessons learned. Show growth and how you applied the learning later. Example: deployed bug to production → learned to implement automated testing and code review checklist." },
  { id: 79, topic: "HR & Behavioral", difficulty: "Medium", question: "How do you handle tight deadlines and pressure?", answer: "Describe systematic approach: prioritize tasks using impact/urgency matrix, break large tasks into smaller ones, communicate early about blockers, stay focused with time-boxing. Give example of successful delivery under pressure. Show you remain calm and organized when stakes are high." },
  { id: 80, topic: "HR & Behavioral", difficulty: "Easy", question: "What are your salary expectations?", answer: "Research market rate for the role and location. Provide a range based on data from Glassdoor, Levels.fyi, etc. Say 'I'm flexible based on the total compensation package including benefits.' Avoid giving a number first if possible. Focus on value you bring rather than needs." },
  { id: 81, topic: "HR & Behavioral", difficulty: "Medium", question: "Why did you leave your last job?", answer: "Be honest but positive. Focus on what you're moving toward, not what you're escaping. Common reasons: wanting more challenge, career growth, learning new tech stack, company direction change. Never badmouth previous employer or colleagues. Keep it brief and professional." },
  { id: 82, topic: "HR & Behavioral", difficulty: "Hard", question: "Tell me about a project you led from start to finish.", answer: "Use STAR method. Describe the problem, your role as leader, how you organized the team, technical decisions you made, challenges overcome, and measurable outcomes. Quantify results where possible. Show leadership, technical depth, and ability to execute. Highlight lessons learned about project management." },

  // ----- MACHINE LEARNING -----
  { id: 83, topic: "Machine Learning", difficulty: "Easy", question: "What is overfitting and how do you prevent it?", answer: "Overfitting is when a model performs well on training data but poorly on new data. Prevention: Regularization (L1/L2), Dropout, Cross-validation, More training data, Early stopping, Reduce model complexity. Use validation set to detect overfitting. If training accuracy is much higher than validation, suspect overfitting." },
  { id: 84, topic: "Machine Learning", difficulty: "Easy", question: "What is the difference between supervised and unsupervised learning?", answer: "Supervised learning uses labeled training data to learn input-output mappings. Examples: classification, regression. Unsupervised learning finds patterns in unlabeled data. Examples: clustering, dimensionality reduction. Supervised needs labeled data, unsupervised does not. Semi-supervised uses small labeled + large unlabeled data." },
  { id: 85, topic: "Machine Learning", difficulty: "Medium", question: "What is the bias-variance tradeoff?", answer: "Bias is error from wrong assumptions — high bias underfits. Variance is error from sensitivity to training data fluctuations — high variance overfits. Tradeoff: increasing model complexity reduces bias but increases variance. Goal is to find the sweet spot that minimizes total error. Regularization controls this balance." },
  { id: 86, topic: "Machine Learning", difficulty: "Medium", question: "What is cross-validation and why use it?", answer: "Cross-validation evaluates model performance on different data subsets to ensure generalization. K-fold splits data into K folds, trains on K-1, validates on remaining, repeats K times. More reliable than single train/test split. Reduces variance in performance estimate. Common values: 5 or 10 folds. Stratified CV preserves class distribution." },
  { id: 87, topic: "Machine Learning", difficulty: "Hard", question: "What is the difference between bagging and boosting?", answer: "Bagging (Bootstrap Aggregating) trains multiple models in parallel on random data subsets and averages predictions — reduces variance. Random Forest is bagging example. Boosting trains models sequentially, each focusing on previous model's errors — reduces bias. AdaBoost, XGBoost, Gradient Boosting are boosting examples." },
  { id: 88, topic: "Machine Learning", difficulty: "Medium", question: "What is gradient descent?", answer: "Gradient descent is an optimization algorithm that minimizes the loss function by iteratively moving in direction of steepest descent. Uses learning rate to control step size. Types: Batch GD (uses all data), Stochastic GD (one sample at a time), Mini-batch GD (batches). Learning rate too high may diverge, too low converges slowly." },
  { id: 89, topic: "Machine Learning", difficulty: "Hard", question: "Explain the transformer architecture in deep learning.", answer: "Transformer uses self-attention mechanism to process sequential data in parallel (vs RNNs sequential). Has encoder and decoder stacks. Self-attention computes relevance between all pairs of positions. Multi-head attention learns different relationship types. Positional encoding adds order information. Foundation for BERT, GPT, T5." },
  { id: 90, topic: "Machine Learning", difficulty: "Easy", question: "What is the difference between classification and regression?", answer: "Classification predicts discrete categories/labels (spam/not spam, digit 0-9). Regression predicts continuous values (house price, temperature). Classification uses accuracy, precision, recall, F1. Regression uses MSE, MAE, R². Common classification algorithms: Logistic Regression, SVM, Random Forest. Regression: Linear Regression, Decision Trees." },
  { id: 91, topic: "Machine Learning", difficulty: "Medium", question: "What is feature engineering and why is it important?", answer: "Feature engineering creates new features from raw data to improve model performance. Includes: handling missing values, encoding categorical variables, scaling numerical features, creating interaction terms, extracting date parts, text vectorization. Good features matter more than complex models. 'Data and features determine max performance, models approximate it.'" },
  { id: 92, topic: "Machine Learning", difficulty: "Hard", question: "What is the difference between L1 and L2 regularization?", answer: "L1 (Lasso) adds sum of absolute weights to loss — produces sparse solutions (many weights become zero). L2 (Ridge) adds sum of squared weights — shrinks weights but doesn't zero them. L1 good for feature selection, L2 good for preventing overfitting with many features. Elastic Net combines both." },

  // ----- NODE.JS -----
  { id: 93, topic: "Node.js", difficulty: "Easy", question: "What is Node.js and what makes it different from browser JavaScript?", answer: "Node.js is a runtime that runs JavaScript on the server using Chrome's V8 engine. Unlike browser JS, Node has access to file system, network, process management via modules like fs, http, os. No DOM, no window object. Uses CommonJS (require) or ES modules (import). Event-driven, non-blocking I/O." },
  { id: 94, topic: "Node.js", difficulty: "Medium", question: "What is the event loop in Node.js?", answer: "Node's event loop phases: timers (setTimeout), pending callbacks, idle/prepare, poll (I/O callbacks), check (setImmediate), close callbacks. Process.nextTick runs before next phase. Microtasks (Promise.then) run between phases. The event loop enables non-blocking async I/O despite single thread." },
  { id: 95, topic: "Node.js", difficulty: "Easy", question: "What is npm and what is package.json?", answer: "npm is Node Package Manager — installs, manages, and publishes packages. package.json is the manifest file containing project metadata: name, version, dependencies, scripts. package-lock.json locks exact dependency versions for reproducible builds. node_modules stores installed packages." },
  { id: 96, topic: "Node.js", difficulty: "Medium", question: "What is the difference between process.nextTick and setImmediate?", answer: "process.nextTick executes before the next event loop phase, after the current operation completes. setImmediate executes in the check phase of the next event loop iteration. nextTick has higher priority. Use nextTick for deferring execution but before I/O. Use setImmediate for scheduling after I/O callbacks." },
  { id: 97, topic: "Node.js", difficulty: "Medium", question: "What is middleware in Express.js?", answer: "Middleware functions have access to req, res, and next. They can execute code, modify req/res, end request, or call next middleware. Types: Application-level (app.use), Router-level, Error-handling (4 params), Built-in (express.json), Third-party (cors, morgan). Order matters — middleware runs in the order it's defined." },
  { id: 98, topic: "Node.js", difficulty: "Hard", question: "How do you handle errors in Node.js async code?", answer: "Use async/await with try-catch blocks. For Express: wrap async handlers in a catch-all middleware. Unhandled promise rejections should have process.on('unhandledRejection') handler. Use domains or cls-hooked for context propagation. Consider using libraries like express-async-errors. Always log errors and return proper HTTP status codes." },
  { id: 99, topic: "Node.js", difficulty: "Hard", question: "What is the cluster module and when would you use it?", answer: "The cluster module creates child processes (workers) that share the same server port, enabling multi-core utilization. Master process distributes connections among workers. Workers can be restarted independently for zero-downtime deployments. Use when Node's single thread is CPU-bound. For I/O-bound apps, one thread often suffices." },
  { id: 100, topic: "Node.js", difficulty: "Easy", question: "What are streams in Node.js?", answer: "Streams are objects for reading/writing data in chunks rather than loading entire data into memory. Types: Readable (read data), Writable (write data), Duplex (both), Transform (modify data). Pipes connect readable to writable streams. Example: fs.createReadStream → pipe → zlib → pipe → fs.createWriteStream. Memory efficient for large files." },
  { id: 101, topic: "Node.js", difficulty: "Medium", question: "What is the difference between require and import?", answer: "require is CommonJS — synchronous, loads at runtime, can be called conditionally. import is ES6 — asynchronous (static analysis), hoisted, must be at top level. require/module.exports work in Node by default. For import/export, use .mjs extension or type:module in package.json. ES modules are the modern standard." },
  { id: 102, topic: "Node.js", difficulty: "Medium", question: "What is the purpose of Express error-handling middleware?", answer: "Error-handling middleware has 4 parameters (err, req, res, next). It catches errors passed via next(err) or thrown in async handlers. Centralizes error logic — logs, formats response, sends appropriate status code. Without it, errors cause unhandled rejections or crash the server." },

  // ----- GIT & DEVOPS -----
  { id: 103, topic: "Git & DevOps", difficulty: "Easy", question: "What is the difference between git merge and git rebase?", answer: "git merge combines branches creating a merge commit, preserving full history. git rebase moves commits to a new base, creating linear history. Use merge for public/shared branches, rebase for local cleanup before push. Both integrate changes but rebase rewrites history. Never rebase committed/pushed changes others depend on." },
  { id: 104, topic: "Git & DevOps", difficulty: "Easy", question: "What is CI/CD?", answer: "CI (Continuous Integration) automatically builds and tests code on every commit, catching integration issues early. CD (Continuous Deployment/Delivery) automatically deploys tested code to production/staging. Tools: Jenkins, GitHub Actions, GitLab CI, CircleCI. Reduces manual errors, speeds up delivery, ensures consistent processes." },
  { id: 105, topic: "Git & DevOps", difficulty: "Medium", question: "What is Docker and how is it different from a virtual machine?", answer: "Docker packages applications with dependencies into lightweight containers sharing the host OS kernel. VMs include full OS with hypervisor — heavier but provide stronger isolation. Containers start in seconds, VMs in minutes. Docker ensures consistent environments across dev/staging/production. Use Docker Compose for multi-container apps." },
  { id: 106, topic: "Git & DevOps", difficulty: "Medium", question: "What is Kubernetes and what problems does it solve?", answer: "Kubernetes (K8s) orchestrates container deployment, scaling, and management. Features: auto-scaling, load balancing, self-healing, rolling updates, service discovery. Solves: container scheduling, resource management, zero-downtime deployments, application portability across clouds. Uses pods, services, deployments, and ingress as core abstractions." },
  { id: 107, topic: "Git & DevOps", difficulty: "Hard", question: "Explain git workflow with feature branches.", answer: "Standard workflow: main branch is production-ready. Create feature branch from main. Work on feature, commit frequently. Push branch, create pull request. Code review + CI checks. Merge to main via squash or rebase. Delete feature branch. GitFlow adds develop, release, hotfix branches. Trunk-based development merges to main daily." },
  { id: 108, topic: "Git & DevOps", difficulty: "Easy", question: "What is the difference between git pull and git fetch?", answer: "git fetch downloads updates from remote but doesn't merge them — safe way to see what changed. git pull = git fetch + git merge — updates and merges. git pull --rebase uses rebase instead of merge. Prefer fetch + review before merging to avoid unexpected conflicts." },
  { id: 109, topic: "Git & DevOps", difficulty: "Medium", question: "What is Infrastructure as Code (IaC)?", answer: "IaC manages infrastructure (servers, networks, databases) through declarative configuration files instead of manual processes. Tools: Terraform (cloud-agnostic), CloudFormation (AWS), Ansible (config management). Benefits: version control, repeatability, automation, self-documenting. Treat infrastructure like application code." },
  { id: 110, topic: "Git & DevOps", difficulty: "Hard", question: "How would you design a CI/CD pipeline for a microservices architecture?", answer: "Each microservice has its own pipeline. Stages: lint → unit tests → build Docker image → push to registry → deploy to staging → integration tests → deploy to production. Use Jenkins or GitHub Actions. Blue-green or canary deployments for zero-downtime. Service mesh for traffic management. Monitoring and rollback automation." },
  { id: 111, topic: "Git & DevOps", difficulty: "Medium", question: "What is monitoring and observability in DevOps?", answer: "Monitoring collects metrics, logs, and traces to track system health. The 3 pillars of observability: Metrics (Prometheus), Logs (ELK Stack), Traces (Jaeger). Set up alerts for anomalies (CPU > 80%, 5xx errors > 1%). Use dashboards (Grafana) for visualization. SLIs (indicators), SLOs (objectives), SLAs (agreements) define reliability targets." },
  { id: 112, topic: "Git & DevOps", difficulty: "Easy", question: "What is the difference between git stash pop and git stash apply?", answer: "git stash pop removes the stash after applying it. git stash apply keeps the stash in the stash list for reuse. Use pop for one-time restore, apply when you want to apply same stash to multiple branches. git stash list shows all stashes. git stash drop removes a stash without applying." },
  { id: 113, topic: "Git & DevOps", difficulty: "Medium", question: "What is a container registry and why is it needed?", answer: "A container registry stores Docker images for distribution. Docker Hub is public. Private registries: AWS ECR, Google Container Registry, Azure Container Registry, self-hosted Harbor. CI builds push images to registry, deployment pulls from registry. Registries support versioning via tags, vulnerability scanning, access control." },
  { id: 114, topic: "Git & DevOps", difficulty: "Hard", question: "Explain blue-green deployment strategy.", answer: "Blue-green maintains two identical environments (blue = current, green = new). Switch traffic from blue to green after testing. Benefits: zero-downtime, instant rollback (switch back to blue). Challenges: double infrastructure cost, database compatibility during switch. Canary deployment is a progressive version — gradually shifting traffic percentage." },

  // ----- Additional tricky/edge case questions to reach 120+ -----
  { id: 115, topic: "Python", difficulty: "Hard", question: "What are Python metaclasses and when would you use them?", answer: "Metaclasses are classes of classes — they define how a class behaves. A class is an instance of its metaclass (default: type). Use metaclasses for: ORM models (SQLAlchemy), singleton pattern, automatically registering classes, modifying class creation. Most developers never need metaclasses — use class decorators when possible." },
  { id: 116, topic: "JavaScript", difficulty: "Hard", question: "What is the difference between Map, WeakMap, Set, and WeakSet in ES6?", answer: "Map stores key-value pairs where keys can be any type (vs objects with string-only keys). WeakMap keys must be objects and are garbage-collected. Set stores unique values. WeakSet stores objects that can be garbage-collected. WeakMap/WeakSet have no size property or iterators. Use WeakMap for private data or avoiding memory leaks." },
  { id: 117, topic: "React", difficulty: "Hard", question: "How does React handle error boundaries?", answer: "Error boundaries are class components implementing componentDidCatch or getDerivedStateFromError. They catch rendering errors in their child tree, display fallback UI, and log errors. Cannot catch: event handlers (use try-catch), async code, server-side rendering, errors in the error boundary itself. React 16+ introduced this feature." },
  { id: 118, topic: "System Design", difficulty: "Hard", question: "How would you design a web crawler that scales?", answer: "Use BFS starting from seed URLs. URL frontier with priority queue. Deduplication using Bloom filter (memory efficient). DNS caching. Distributed crawling with worker nodes coordinated by message queue. Respect robots.txt. Store raw pages in distributed file system (HDFS). Parse and extract links. Use politeness policy (delay between requests to same host)." },
  { id: 119, topic: "SQL", difficulty: "Hard", question: "What are database isolation levels and what problems do they solve?", answer: "Read Uncommitted (dirty reads possible), Read Committed (dirty reads prevented — default in PostgreSQL), Repeatable Read (dirty + non-repeatable reads prevented — default in MySQL), Serializable (all anomalies prevented, slowest). Anomalies: dirty read (see uncommitted data), non-repeatable read (same query different results), phantom read (rows appear/disappear)." },
  { id: 120, topic: "Machine Learning", difficulty: "Medium", question: "What is the confusion matrix and what metrics can you derive from it?", answer: "Confusion matrix shows TP (true positives), TN, FP (false positives — Type I error), FN (false negatives — Type II error). Derived metrics: Accuracy = (TP+TN)/(total), Precision = TP/(TP+FP), Recall = TP/(TP+FN), F1 = 2*Precision*Recall/(Precision+Recall), Specificity = TN/(TN+FP). Choose based on problem: recall for cancer detection (avoid false negatives)." },
  { id: 121, topic: "Java", difficulty: "Hard", question: "What is the difference between synchronized and volatile in Java?", answer: "volatile guarantees visibility — changes by one thread are immediately visible to others. synchronized guarantees both visibility and atomicity — only one thread can execute the block at a time. volatile is cheaper but cannot protect compound operations (like i++). synchronized is heavier but provides mutual exclusion. Use volatile for flags, synchronized for compound operations." },
  { id: 122, topic: "Data Structures", difficulty: "Hard", question: "Explain the trie data structure and its use cases.", answer: "A trie (prefix tree) stores strings where each node represents a character. Root to leaf path forms a word. Search is O(L) where L is word length, independent of number of words. Uses: autocomplete, spell checker, IP routing, dictionary. Memory intensive but fast. Compressed (radix tree) variant reduces memory. Can be replaced by hash set for simple lookups." },
  { id: 123, topic: "HR & Behavioral", difficulty: "Medium", question: "How do you stay updated with the latest technology trends?", answer: "Follow industry blogs (Hacker News, Dev.to, Medium), subscribe to newsletters (Daily.dev, ByteByteGo), take online courses (Coursera, Udemy), contribute to open source, attend meetups/conferences, read engineering blogs from top companies (Netflix Tech, Uber Engineering). Dedicate weekly learning time. Build side projects to practice." },
  { id: 124, topic: "Node.js", difficulty: "Medium", question: "What is the purpose of package-lock.json?", answer: "package-lock.json locks exact versions of all dependencies and their transitive dependencies. Ensures reproducible installs across environments. Records integrity hashes for security. npm install reads lock file first if exists. Without it, different machines may get different versions. Always commit lock file to version control." },
  { id: 125, topic: "Git & DevOps", difficulty: "Medium", question: "What is the difference between git reset and git revert?", answer: "git reset moves the branch pointer backward, removing commits from history — dangerous for shared branches. git revert creates a new commit that undoes changes — safe for shared branches. Reset has modes: --soft (keep changes staged), --mixed (keep changes unstaged), --hard (discard changes). Revert is always safe to use." },
  { id: 126, topic: "React", difficulty: "Medium", question: "What is the purpose of React.StrictMode?", answer: "StrictMode is a development-only wrapper that helps identify potential problems. It double-invokes effects and renders to detect side-effect bugs, warns about deprecated APIs, and checks for unsafe lifecycle methods. Runs only in development. Helps with preparing for concurrent mode. Does not affect production build." },
  { id: 127, topic: "JavaScript", difficulty: "Medium", question: "What are service workers and what can they do?", answer: "Service workers are scripts that run in the background separate from web pages. Enable: offline support (cache-first strategy), push notifications, background sync. Act as a proxy between browser and network. Must be served over HTTPS. Lifecycle: register, install, activate, fetch events. Power Progressive Web Apps (PWAs). Cannot access DOM directly." },
  { id: 128, topic: "SQL", difficulty: "Medium", question: "What is a view in SQL and when would you use it?", answer: "A view is a virtual table based on a SELECT query. It doesn't store data — shows fresh data when queried. Uses: simplify complex queries, restrict access to specific columns/rows, create computed columns. Materialized views store data physically for faster access but need refreshing. Views can be updated in some cases depending on structure." },
  { id: 129, topic: "Machine Learning", difficulty: "Hard", question: "What is adversarial validation and when would you use it?", answer: "Adversarial validation detects distribution shifts between training and test data. Train a classifier to distinguish train vs test samples. If the classifier performs well (AUC > 0.8), there's a significant drift. Helps identify which features cause the shift. Important for production ML where data distribution changes over time. Guides feature engineering and data cleaning." },
  { id: 130, topic: "Python", difficulty: "Medium", question: "What are context managers in Python and how do they work?", answer: "Context managers control setup and teardown using 'with' statement. Implement __enter__ (runs at start) and __exit__ (runs at end, even on exceptions). Built-in: open files, acquire locks, database connections. Create custom context manager: class with __enter__/__exit__ or using @contextmanager decorator with generator. Ensures resource cleanup." },
];

const TOPICS = ["All", "Python", "Java", "JavaScript", "React", "SQL", "Data Structures", "System Design", "HR & Behavioral", "Machine Learning", "Node.js", "Git & DevOps"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const TOPIC_COLORS = {
  "Python": "from-blue-500 to-cyan-500",
  "Java": "from-red-500 to-orange-500",
  "JavaScript": "from-yellow-500 to-amber-500",
  "React": "from-sky-500 to-blue-500",
  "SQL": "from-purple-500 to-pink-500",
  "Data Structures": "from-emerald-500 to-teal-500",
  "System Design": "from-indigo-500 to-purple-500",
  "HR & Behavioral": "from-rose-500 to-pink-500",
  "Machine Learning": "from-orange-500 to-red-500",
  "Node.js": "from-green-500 to-emerald-500",
  "Git & DevOps": "from-cyan-500 to-blue-500",
};

const DIFFICULTY_COLORS = {
  "Easy": "text-green-400 bg-green-500/10 border-green-500/20",
  "Medium": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Hard": "text-red-400 bg-red-500/10 border-red-500/20",
};

const InterviewBank = ({ toast }) => {
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ssos_bookmarks') || '[]'); } catch { return []; }
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [helpfulClicks, setHelpfulClicks] = useState({});
  const randomRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('ssos_bookmarks', JSON.stringify(bookmarks)); } catch {}
  }, [bookmarks]);

  const filtered = useMemo(() => {
    let qs = QUESTIONS;
    if (activeTopic !== "All") qs = qs.filter(q => q.topic === activeTopic);
    if (activeDifficulty !== "All") qs = qs.filter(q => q.difficulty === activeDifficulty);
    if (search.trim()) {
      const term = search.toLowerCase();
      qs = qs.filter(q => q.question.toLowerCase().includes(term) || q.answer.toLowerCase().includes(term));
    }
    return qs;
  }, [activeTopic, activeDifficulty, search]);

  const displayQuestions = showBookmarks
    ? QUESTIONS.filter(q => bookmarks.includes(q.id))
    : filtered;

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleBookmark = (id) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    if (toast) toast(bookmarks.includes(id) ? 'Bookmark removed' : 'Question bookmarked!', 'info');
  };

  const showRandom = () => {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setRandomQuestion(q);
    setExpanded({ [q.id]: true });
    if (randomRef.current) randomRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleHelpful = (id, type) => {
    setHelpfulClicks(prev => ({ ...prev, [id]: type }));
    if (toast) toast(type === 'up' ? 'Glad it helped!' : 'Thanks for the feedback!', 'info');
  };

  const highlightText = (text, term) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => regex.test(part)
      ? <span key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</span>
      : part);
  };

  const uniqueTopics = [...new Set(QUESTIONS.map(q => q.topic))];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <BookOpen size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Interview Q&A Bank</h2>
        <p className="text-gray-400 text-sm">{QUESTIONS.length}+ questions across {uniqueTopics.length} topics</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{QUESTIONS.length}+</div>
          <p className="text-xs text-gray-500 mt-1">Total Questions</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{uniqueTopics.length}</div>
          <p className="text-xs text-gray-500 mt-1">Topics Covered</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{bookmarks.length}</div>
          <p className="text-xs text-gray-500 mt-1">Your Bookmarks</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={showRandom}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition">
          <Shuffle size={14} /> Random Question
        </button>
        <button onClick={() => setShowBookmarks(!showBookmarks)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${
            showBookmarks ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'border-gray-600 text-gray-400 hover:bg-white/5'
          }`}>
          <Bookmark size={14} /> {showBookmarks ? 'Show All' : 'Bookmarks'}
        </button>
      </div>

      {randomQuestion && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          ref={randomRef} className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-400 font-semibold">Random Question</span>
            <button onClick={() => { setRandomQuestion(null); setExpanded({}); }} className="text-gray-500 hover:text-white transition"><X size={14} /></button>
          </div>
          <p className="text-sm font-medium text-white mb-1">{randomQuestion.question}</p>
          <div className="flex gap-2 mb-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium bg-gradient-to-r ${TOPIC_COLORS[randomQuestion.topic] || 'from-gray-500 to-gray-600'} text-white`}>{randomQuestion.topic}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${DIFFICULTY_COLORS[randomQuestion.difficulty]}`}>{randomQuestion.difficulty}</span>
          </div>
          <AnimatePresence>
            {expanded[randomQuestion.id] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="text-sm text-gray-300 border-t border-gray-700 pt-3 mt-2">{randomQuestion.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => toggleExpand(randomQuestion.id)} className="text-xs text-blue-400 hover:text-blue-300 transition mt-2 flex items-center gap-1">
            {expanded[randomQuestion.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded[randomQuestion.id] ? 'Hide Answer' : 'Show Answer'}
          </button>
        </motion.div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions by keyword..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TOPICS.map(topic => (
          <button key={topic} onClick={() => { setActiveTopic(topic); setShowBookmarks(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              activeTopic === topic
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'border-gray-600 text-gray-400 hover:bg-white/5'
            }`}>
            {topic}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {DIFFICULTIES.map(d => (
          <button key={d} onClick={() => setActiveDifficulty(d)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              activeDifficulty === d
                ? d === 'Easy' ? 'bg-green-500/20 border-green-500/30 text-green-400' : d === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : d === 'Hard' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'border-gray-600 text-gray-400 hover:bg-white/5'
            }`}>
            {d}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">{displayQuestions.length} question{displayQuestions.length !== 1 ? 's' : ''} found</p>

      <div className="space-y-3">
        {displayQuestions.map(q => (
          <motion.div key={q.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/20 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-2">{highlightText(q.question, search)}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium text-white bg-gradient-to-r ${TOPIC_COLORS[q.topic] || 'from-gray-500 to-gray-600'}`}>
                    {q.topic}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${DIFFICULTY_COLORS[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleBookmark(q.id)}
                  className={`p-1.5 rounded-lg transition ${bookmarks.includes(q.id) ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-500 hover:text-gray-300'}`}>
                  <Star size={15} fill={bookmarks.includes(q.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <button onClick={() => toggleExpand(q.id)}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
              {expanded[q.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded[q.id] ? 'Hide Answer' : 'Show Answer'}
            </button>

            <AnimatePresence>
              {expanded[q.id] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="border-t border-gray-700/50 mt-3 pt-3 space-y-3">
                    <p className="text-sm text-gray-300 leading-relaxed">{highlightText(q.answer, search)}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Was this helpful?</span>
                      <button onClick={() => handleHelpful(q.id, 'up')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${helpfulClicks[q.id] === 'up' ? 'text-green-400 bg-green-500/10' : 'hover:text-gray-300'}`}>
                        <ThumbsUp size={12} /> Yes
                      </button>
                      <button onClick={() => handleHelpful(q.id, 'down')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${helpfulClicks[q.id] === 'down' ? 'text-red-400 bg-red-500/10' : 'hover:text-gray-300'}`}>
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {displayQuestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No questions match your filters.</p>
            <button onClick={() => { setActiveTopic('All'); setActiveDifficulty('All'); setSearch(''); setShowBookmarks(false); }}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewBank;
