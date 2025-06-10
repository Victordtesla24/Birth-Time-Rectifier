"""Tests for the performance optimization module."""

import pytest
import time
from unittest.mock import Mock, patch
from ..performance_optimizer import PerformanceOptimizer

@pytest.fixture
def optimizer():
    """Create performance optimizer instance."""
    return PerformanceOptimizer()

def test_initialization(optimizer):
    """Test performance optimizer initialization."""
    assert optimizer.local_cache == {}
    assert optimizer.cache_stats == {"hits": 0, "misses": 0}
    assert optimizer.batch_size == 100
    assert optimizer.batch_queue == []
    assert optimizer.thread_pool is not None
    assert optimizer.process_pool is not None

def test_cache_operations(optimizer):
    """Test caching functionality."""
    # Test cache write
    optimizer.cache_result("test_key", "test_value")
    assert "test_key" in optimizer.local_cache
    assert optimizer.local_cache["test_key"]["result"] == "test_value"
    
    # Test cache read
    result = optimizer.get_cached_result("test_key")
    assert result == "test_value"
    assert optimizer.cache_stats["hits"] == 1
    
    # Test cache miss
    result = optimizer.get_cached_result("nonexistent_key")
    assert result is None
    assert optimizer.cache_stats["misses"] == 1
    
    # Test cache expiration
    with patch('time.time') as mock_time:
        # Set current time
        mock_time.return_value = 0
        optimizer.cache_result("expiring_key", "value", ttl=1)
        
        # Check value exists
        assert optimizer.get_cached_result("expiring_key") == "value"
        
        # Move time forward past TTL
        mock_time.return_value = 2
        assert optimizer.get_cached_result("expiring_key") is None

def test_parallel_processing(optimizer):
    """Test parallel processing capabilities."""
    def task():
        time.sleep(0.1)
        return 42
    
    tasks = [task for _ in range(5)]
    
    # Test thread-based parallel processing
    results = optimizer.process_parallel(tasks)
    assert len(results) == 5
    assert all(r == 42 for r in results)
    
    # Test process-based parallel processing
    results = optimizer.process_parallel(tasks, use_processes=True)
    assert len(results) == 5
    assert all(r == 42 for r in results)

def test_batch_processing(optimizer):
    """Test batch processing functionality."""
    processor = Mock(return_value=42)
    
    # Test single item (shouldn't trigger batch processing)
    result = optimizer.process_batch("item1", processor)
    assert result is None
    assert len(optimizer.batch_queue) == 1
    
    # Fill batch queue to trigger processing
    results = []
    for i in range(optimizer.batch_size):
        result = optimizer.process_batch(f"item{i}", processor)
        if result:
            results.extend(result)
    
    assert len(results) == optimizer.batch_size
    assert all(r == 42 for r in results)
    assert len(optimizer.batch_queue) == 0

def test_distributed_computation(optimizer):
    """Test distributed computation capabilities."""
    def task():
        return 42
    
    tasks = [task for _ in range(10)]
    nodes = ["node1", "node2"]
    
    results = optimizer.distribute_computation(tasks, nodes)
    assert len(results) == 10
    assert all(r == 42 for r in results)

def test_performance_metrics(optimizer):
    """Test performance metrics collection."""
    # Simulate some activity
    optimizer.cache_result("key1", "value1")
    optimizer.get_cached_result("key1")
    optimizer.get_cached_result("nonexistent")
    
    def task():
        time.sleep(0.1)
        return 42
    
    optimizer.process_parallel([task])
    
    # Get metrics
    metrics = optimizer.get_performance_metrics()
    
    assert "cache_stats" in metrics
    assert "active_tasks" in metrics
    assert "memory_usage" in metrics
    assert "total_requests" in metrics
    assert "avg_processing_time" in metrics
    
    assert metrics["cache_stats"]["hits"] == 1
    assert metrics["cache_stats"]["misses"] == 1

def test_resource_monitoring(optimizer):
    """Test resource monitoring functionality."""
    # Let the monitoring thread run for a bit
    time.sleep(0.1)
    
    # Check if memory usage is being tracked
    assert optimizer.MEMORY_USAGE._value.get() > 0

def test_error_handling(optimizer):
    """Test error handling in various scenarios."""
    # Test batch processing error handling
    def failing_processor(x):
        raise ValueError("Test error")
    
    # Fill batch queue
    for i in range(optimizer.batch_size):
        optimizer.process_batch(f"item{i}", failing_processor)
    
    # Should return empty list on error
    assert len(optimizer.batch_queue) == 0
    
    # Test parallel processing error handling
    def failing_task():
        raise ValueError("Test error")
    
    # Should not raise exception
    results = optimizer.process_parallel([failing_task])
    assert len(results) == 1
    assert isinstance(results[0], ValueError)

def test_cache_backend_fallback(optimizer):
    """Test cache backend fallback behavior."""
    # Test Redis fallback
    with patch('redis.from_url') as mock_redis:
        mock_redis.side_effect = Exception("Redis connection error")
        optimizer_with_redis = PerformanceOptimizer(redis_url="redis://localhost")
        
        # Should still work with local cache
        optimizer_with_redis.cache_result("key", "value")
        assert optimizer_with_redis.get_cached_result("key") == "value" 