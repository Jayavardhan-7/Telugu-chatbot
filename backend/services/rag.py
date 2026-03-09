import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_ollama import OllamaLLM

# Load multilingual embeddings capable of understanding Telugu
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

def get_vector_db():
    return Chroma(
        persist_directory=CHROMA_DB_DIR, 
        embedding_function=embedding_model,
        collection_name="telugu_culture"
    )

def add_document(text: str, metadata: dict = None):
    db = get_vector_db()
    doc = Document(page_content=text, metadata=metadata or {})
    db.add_documents([doc])

def retrieve_context(query: str, k: int = 3):
    db = get_vector_db()
    docs = db.similarity_search(query, k=k)
    return [doc.page_content for doc in docs]

# Initialize Ollama LLM (expecting llama3 or mistral to be running locally)
def get_llm():
    return OllamaLLM(model="llama3")

def generate_rag_response(query: str):
    context_docs = retrieve_context(query)
    context_text = "\n".join(context_docs)
    
    # Prompt emphasizing Telugu language response
    prompt = f"""
    You are a helpful and knowledgeable Telugu cultural chatbot. 
    You must answer the user's question primarily in the Telugu language.
    Use the following pieces of retrieved context to answer the question.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    
    Context:
    {context_text}
    
    Question: {query}
    
    Answer in Telugu:
    """
    
    llm = get_llm()
    response = llm.invoke(prompt)
    return response

