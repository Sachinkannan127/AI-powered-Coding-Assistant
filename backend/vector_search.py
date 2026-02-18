"""
Vector database for semantic code search
Using FAISS for local deployment or Pinecone for cloud
"""

import os
from typing import List, Dict, Any, Optional
import numpy as np

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("Warning: faiss not installed. Using fallback mode.")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("Warning: sentence-transformers not installed. Semantic search disabled.")
    print("Install with: pip install sentence-transformers")

import json
import pickle


class VectorStore:
    """
    Semantic search for code snippets using vector embeddings
    """
    
    def __init__(self, use_pinecone: bool = False):
        self.use_pinecone = use_pinecone
        self.enabled = SENTENCE_TRANSFORMERS_AVAILABLE
        self.index = None
        
        if not self.enabled:
            print("VectorStore disabled - sentence-transformers not available")
            return
        
        # Initialize embedding model
        self.encoder = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.embedding_dim = 384  # Dimension for all-MiniLM-L6-v2
        
        if use_pinecone:
            self._init_pinecone()
        else:
            if FAISS_AVAILABLE:
                self._init_faiss()
            else:
                print("FAISS not available, vector search limited")
                self.enabled = False
                return
        
        # Storage for metadata
        self.metadata_store = []
        self.metadata_file = "vector_metadata.json"
        self._load_metadata()
    
    def _init_faiss(self):
        """Initialize FAISS index for local vector search"""
        if not FAISS_AVAILABLE:
            return
            
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.index_file = "faiss_index.bin"
        
        # Load existing index if available
        if os.path.exists(self.index_file):
            self.index = faiss.read_index(self.index_file)
    
    def _init_pinecone(self):
        """Initialize Pinecone for cloud vector search"""
        try:
            import pinecone
            
            pinecone.init(
                api_key=os.getenv("PINECONE_API_KEY"),
                environment=os.getenv("PINECONE_ENV", "us-west1-gcp")
            )
            
            index_name = "devcopilot-code-search"
            
            # Create index if it doesn't exist
            if index_name not in pinecone.list_indexes():
                pinecone.create_index(
                    index_name,
                    dimension=self.embedding_dim,
                    metric="cosine"
                )
            
            self.index = pinecone.Index(index_name)
        except ImportError:
            print("Pinecone not installed, falling back to FAISS")
            self.use_pinecone = False
            self._init_faiss()
    
    def _load_metadata(self):
        """Load metadata from disk"""
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                self.metadata_store = json.load(f)
    
    def _save_metadata(self):
        """Save metadata to disk"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata_store, f, indent=2)
    
    async def store_snippet(
        self, 
        code: str, 
        description: str, 
        language: str,
        user_id: Optional[str] = None
    ) -> str:
        """
        Store code snippet with vector embedding
        """
        if not self.enabled:
            return "0"  # Return dummy ID when disabled
        
        # Create searchable text combining code and description
        searchable_text = f"{description}\n\n{code}"
        
        # Generate embedding
        embedding = self.encoder.encode([searchable_text])[0]
        
        # Metadata
        metadata = {
            "id": len(self.metadata_store),
            "code": code,
            "description": description,
            "language": language,
            "user_id": user_id
        }
        
        if self.use_pinecone:
            # Store in Pinecone
            self.index.upsert([(str(metadata["id"]), embedding.tolist(), metadata)])
        else:
            # Store in FAISS
            if FAISS_AVAILABLE and self.index is not None:
                self.index.add(np.array([embedding]))
                self.metadata_store.append(metadata)
                
                # Save to disk
                faiss.write_index(self.index, self.index_file)
                self._save_metadata()
        
        return str(metadata["id"])
    
    async def search(
        self, 
        query: str, 
        language: Optional[str] = None, 
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Semantic search for code snippets
        """
        if not self.enabled:
            return []  # Return empty list when disabled
        
        # Generate query embedding
        query_embedding = self.encoder.encode([query])[0]
        
        if self.use_pinecone:
            # Search in Pinecone
            results = self.index.query(
                query_embedding.tolist(),
                top_k=limit,
                include_metadata=True,
                filter={"language": language} if language else None
            )
            
            return [
                {
                    "code": match["metadata"]["code"],
                    "description": match["metadata"]["description"],
                    "language": match["metadata"]["language"],
                    "score": match["score"]
                }
                for match in results["matches"]
            ]
        else:
            # Search in FAISS
            distances, indices = self.index.search(np.array([query_embedding]), limit * 2)
            
            results = []
            for idx, distance in zip(indices[0], distances[0]):
                if idx < len(self.metadata_store):
                    metadata = self.metadata_store[idx]
                    
                    # Filter by language if specified
                    if language and metadata["language"] != language:
                        continue
                    
                    results.append({
                        "code": metadata["code"],
                        "description": metadata["description"],
                        "language": metadata["language"],
                        "score": float(distance)
                    })
                    
                    if len(results) >= limit:
                        break
            
            return results
    
    async def delete_snippet(self, snippet_id: str):
        """Delete a code snippet"""
        if self.use_pinecone:
            self.index.delete([snippet_id])
        else:
            # FAISS doesn't support deletion easily
            # Would need to rebuild index excluding the item
            pass
