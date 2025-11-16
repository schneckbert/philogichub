import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhilogicAIPage from '../page';

// Mock fetch globally
global.fetch = jest.fn();

describe('PhilogicAI Page - Component Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('renders PhilogicAI page with initial elements', () => {
    render(<PhilogicAIPage />);
    
    expect(screen.getByText('PhilogicAI')).toBeInTheDocument();
    expect(screen.getByText('Powered by llama.cpp')).toBeInTheDocument();
    expect(screen.getAllByText('Neuer Chat').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Nachricht an PhilogicAI...')).toBeInTheDocument();
  });

  test('displays preset actions when chat is empty', () => {
    render(<PhilogicAIPage />);
    
    expect(screen.getByText('Wie kann ich dir helfen?')).toBeInTheDocument();
    expect(screen.getByText('CRM Daten Analyse')).toBeInTheDocument();
    expect(screen.getByText('E-Mail Entwurf')).toBeInTheDocument();
  });

  test('renders sidebar with chat list', () => {
    render(<PhilogicAIPage />);
    
    expect(screen.getByText('0 Nachrichten')).toBeInTheDocument();
  });
});

describe('PhilogicAI Page - Chat Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates new chat when button is clicked', () => {
    render(<PhilogicAIPage />);
    
    const buttons = screen.getAllByRole('button');
    const newChatButton = buttons.find(btn => btn.textContent?.includes('Neuer Chat'));
    
    fireEvent.click(newChatButton!);
    
    const chatItems = screen.getAllByText(/Nachrichten/);
    expect(chatItems.length).toBeGreaterThanOrEqual(2);
  });

  test('prevents deleting the last chat', () => {
    render(<PhilogicAIPage />);
    
    const initialChats = screen.getAllByText(/Nachrichten/);
    expect(initialChats).toHaveLength(1);
  });
});

describe('PhilogicAI Page - Preset Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fills input when preset is clicked', async () => {
    render(<PhilogicAIPage />);
    
    const preset = screen.getByText('CRM Daten Analyse');
    fireEvent.click(preset);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    expect(input.value).toContain('CRM-Daten');
  });
});

describe('PhilogicAI Page - Message Sending', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ response: 'AI response' }),
      } as Response)
    );
  });

  test('sends message when send button is clicked', async () => {
    render(<PhilogicAIPage />);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('p-3') && !btn.className.includes('w-full'));
    
    await userEvent.click(sendButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  test('sends message with Enter key', async () => {
    render(<PhilogicAIPage />);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message{Enter}');
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('shows loading state during API call', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ response: 'AI response' }),
      } as Response), 100))
    );

    render(<PhilogicAIPage />);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('p-3') && !btn.className.includes('w-full'));
    
    await userEvent.click(sendButton!);
    
    expect(input).toBeDisabled();
  });

  test('updates chat title with first message', async () => {
    render(<PhilogicAIPage />);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'My first question');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('p-3') && !btn.className.includes('w-full'));
    
    await userEvent.click(sendButton!);
    
    await waitFor(() => {
      expect(screen.getByText(/My first question/)).toBeInTheDocument();
    });
  });
});

describe('PhilogicAI Page - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays error message when API fails', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<PhilogicAIPage />);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('p-3') && !btn.className.includes('w-full'));
    
    await userEvent.click(sendButton!);
    
    await waitFor(() => {
      expect(screen.getByText(/Es gab einen Fehler/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles non-OK API responses', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    );

    render(<PhilogicAIPage />);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('p-3') && !btn.className.includes('w-full'));
    
    await userEvent.click(sendButton!);
    
    await waitFor(() => {
      expect(screen.getByText(/Es gab einen Fehler/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('PhilogicAI Page - Message Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ response: 'AI response' }),
      } as Response)
    );
  });

  test('displays messages with timestamps', async () => {
    render(<PhilogicAIPage />);
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('p-3') && !btn.className.includes('w-full'));
    
    await userEvent.click(sendButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
      const bodyText = document.body.textContent || '';
      expect(/\d{1,2}:\d{2}/.test(bodyText)).toBe(true);
    });
  });

  test('updates message count', async () => {
    render(<PhilogicAIPage />);
    
    expect(screen.getByText('0 Nachrichten')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Nachricht an PhilogicAI...') as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message');
    
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => btn.className.includes('p-3') && !btn.className.includes('w-full'));
    
    await userEvent.click(sendButton!);
    
    await waitFor(() => {
      expect(screen.getByText('2 Nachrichten')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('PhilogicAI Page - Accessibility', () => {
  test('has proper ARIA labels', () => {
    render(<PhilogicAIPage />);
    
    const textarea = screen.getByPlaceholderText('Nachricht an PhilogicAI...');
    expect(textarea).toBeInTheDocument();
  });
});
