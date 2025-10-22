import html2canvas from 'html2canvas';

export async function downloadWalletAsImage(element: HTMLElement, fileName: string = 'carteira-catolica.png') {
  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Error downloading wallet:', error);
    throw error;
  }
}

export async function shareWallet(element: HTMLElement, title: string = 'Minha Carteirinha Católica') {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'carteira-catolica.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: 'Confira minha carteirinha católica digital!',
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error sharing wallet:', error);
    throw error;
  }
}
