"""Performance optimization module for advanced caching and processing strategies."""

from typing import Dict, Any, List, Optional, Callable
import multiprocessing as mp
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import threading
import time
import logging
from functools import lru_cache
import redis
from prometheus_client import Counter, Histogram, Gauge
import psutil

logger = logging.getLogger(__name__)

class PerformanceOptimizer:
    """Advanced performance optimization with caching and parallel processing."""
    
    def __init__(self, redis_url: Optional[str] = None):
        """Initialize performance optimizer."""
        # Advanced caching setup
        self.local_cache = {}
        self.cache_stats = {"hits": 0, "misses": 0}
        self.redis_client = redis.from_url(redis_url) if redis_url else None
        
        # Parallel processing setup
        self.thread_pool = ThreadPoolExecutor(max_workers=mp.cpu_count())
        self.process_pool = ProcessPoolExecutor(max_workers=mp.cpu_count())
        
        # Batch processing setup
        self.batch_size = 100
        self.batch_queue = []
        self.batch_lock = threading.Lock()
        
        # Performance metrics
        self.REQUEST_COUNT = Counter('request_total', 'Total requests processed')
        self.PROCESSING_TIME = Histogram('processing_seconds', 'Time spent processing')
        self.ACTIVE_TASKS = Gauge('active_tasks', 'Number of active tasks')
        self.MEMORY_USAGE = Gauge('memory_usage_bytes', 'Current memory usage')
        
        # Resource monitoring
        self._start_resource_monitoring()
    
    def cache_result(self, key: str, result: Any, ttl: int = 3600) -> None:
        """Cache result with advanced strategies."""
        # Local cache
        self.local_cache[key] = {
            'result': result,
            'timestamp': time.time(),
            'ttl': ttl
        }
        
        # Redis cache if available
        if self.redis_client:
            try:
                self.redis_client.setex(key, ttl, str(result))
            except redis.RedisError as e:
                logger.error(f"Redis caching error: {str(e)}")
    
    def get_cached_result(self, key: str) -> Optional[Any]:
        """Get result from cache with fallback strategy."""
        # Check local cache first
        if key in self.local_cache:
            cache_entry = self.local_cache[key]
            if time.time() - cache_entry['timestamp'] < cache_entry['ttl']:
                self.cache_stats["hits"] += 1
                return cache_entry['result']
            else:
                del self.local_cache[key]
        
        # Try Redis cache
        if self.redis_client:
            try:
                result = self.redis_client.get(key)
                if result:
                    self.cache_stats["hits"] += 1
                    return eval(result)
            except redis.RedisError as e:
                logger.error(f"Redis retrieval error: {str(e)}")
        
        self.cache_stats["misses"] += 1
        return None
    
    def process_parallel(self, tasks: List[Callable], use_processes: bool = False) -> List[Any]:
        """Execute tasks in parallel using either threads or processes."""
        self.ACTIVE_TASKS.inc(len(tasks))
        
        try:
            executor = self.process_pool if use_processes else self.thread_pool
            results = list(executor.map(lambda f: f(), tasks))
            return results
        finally:
            self.ACTIVE_TASKS.dec(len(tasks))
    
    def process_batch(self, item: Any, processor: Callable) -> Optional[List[Any]]:
        """Process items in batches for improved performance."""
        with self.batch_lock:
            self.batch_queue.append(item)
            
            if len(self.batch_queue) >= self.batch_size:
                batch = self.batch_queue[:]
                self.batch_queue.clear()
                return self._process_batch_items(batch, processor)
        return None
    
    def _process_batch_items(self, items: List[Any], processor: Callable) -> List[Any]:
        """Process a batch of items with metrics tracking."""
        start_time = time.time()
        
        try:
            results = []
            # Process in chunks for better memory management
            chunk_size = min(100, len(items))
            for i in range(0, len(items), chunk_size):
                chunk = items[i:i + chunk_size]
                chunk_results = self.process_parallel(
                    [lambda x=item: processor(x) for item in chunk]
                )
                results.extend(chunk_results)
            
            processing_time = time.time() - start_time
            self.PROCESSING_TIME.observe(processing_time)
            self.REQUEST_COUNT.inc(len(items))
            
            return results
        except Exception as e:
            logger.error(f"Batch processing error: {str(e)}")
            return []
    
    def distribute_computation(self, tasks: List[Callable], nodes: List[str]) -> List[Any]:
        """Distribute computation across multiple nodes."""
        # Simplified implementation - in real scenario, would use proper distributed computing framework
        chunks = self._split_tasks(tasks, len(nodes))
        
        def process_chunk(chunk: List[Callable]) -> List[Any]:
            return self.process_parallel(chunk, use_processes=True)
        
        results = []
        for chunk in chunks:
            chunk_results = process_chunk(chunk)
            results.extend(chunk_results)
        
        return results
    
    def _split_tasks(self, tasks: List[Callable], num_chunks: int) -> List[List[Callable]]:
        """Split tasks into chunks for distributed processing."""
        chunk_size = max(1, len(tasks) // num_chunks)
        return [tasks[i:i + chunk_size] for i in range(0, len(tasks), chunk_size)]
    
    def _start_resource_monitoring(self) -> None:
        """Start monitoring system resources."""
        def monitor_resources():
            while True:
                process = psutil.Process()
                self.MEMORY_USAGE.set(process.memory_info().rss)
                time.sleep(1)
        
        threading.Thread(target=monitor_resources, daemon=True).start()
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics."""
        return {
            "cache_stats": self.cache_stats,
            "active_tasks": self.ACTIVE_TASKS._value.get(),
            "memory_usage": self.MEMORY_USAGE._value.get(),
            "total_requests": self.REQUEST_COUNT._value.get(),
            "avg_processing_time": sum(self.PROCESSING_TIME._sum.get()) / max(1, self.PROCESSING_TIME._count.get())
        } 