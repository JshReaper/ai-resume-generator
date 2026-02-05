import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DualLanguageSelector } from './DualLanguageSelector';

describe('DualLanguageSelector', () => {
  const mockOnUiLanguageChange = jest.fn();
  const mockOnCvLanguageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both language selectors', () => {
    render(
      <DualLanguageSelector
        uiLanguage="en"
        cvLanguage="en"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('displays correct UI language label in English', () => {
    render(
      <DualLanguageSelector
        uiLanguage="en"
        cvLanguage="en"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    expect(screen.getByText('Interface:')).toBeInTheDocument();
    expect(screen.getByText('CV Output:')).toBeInTheDocument();
  });

  it('displays correct UI language label in Danish', () => {
    render(
      <DualLanguageSelector
        uiLanguage="da"
        cvLanguage="da"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    expect(screen.getByText('Grænseflade:')).toBeInTheDocument();
    expect(screen.getByText('CV Sprog:')).toBeInTheDocument();
  });

  it('calls onUiLanguageChange when UI language is changed', () => {
    render(
      <DualLanguageSelector
        uiLanguage="en"
        cvLanguage="en"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const uiSelector = selects[0];

    fireEvent.change(uiSelector, { target: { value: 'da' } });

    expect(mockOnUiLanguageChange).toHaveBeenCalledWith('da');
    expect(mockOnCvLanguageChange).not.toHaveBeenCalled();
  });

  it('calls onCvLanguageChange when CV language is changed', () => {
    render(
      <DualLanguageSelector
        uiLanguage="en"
        cvLanguage="en"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const cvSelector = selects[1];

    fireEvent.change(cvSelector, { target: { value: 'da' } });

    expect(mockOnCvLanguageChange).toHaveBeenCalledWith('da');
    expect(mockOnUiLanguageChange).not.toHaveBeenCalled();
  });

  it('allows independent language selection', () => {
    const { rerender } = render(
      <DualLanguageSelector
        uiLanguage="en"
        cvLanguage="en"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    // Change UI to Danish
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'da' } });

    // Rerender with Danish UI but English CV
    rerender(
      <DualLanguageSelector
        uiLanguage="da"
        cvLanguage="en"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    // Verify Danish UI labels
    expect(screen.getByText('Grænseflade:')).toBeInTheDocument();

    // Verify CV selector is still English
    const cvSelector = selects[1];
    expect(cvSelector).toHaveValue('en');
  });

  it('shows all language options', () => {
    render(
      <DualLanguageSelector
        uiLanguage="en"
        cvLanguage="en"
        onUiLanguageChange={mockOnUiLanguageChange}
        onCvLanguageChange={mockOnCvLanguageChange}
      />
    );

    const selects = screen.getAllByRole('combobox');

    selects.forEach(select => {
      const options = select.querySelectorAll('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('en');
      expect(options[1]).toHaveValue('da');
    });
  });
});
