/* Outgoing payout review. Preview and externally completed transfers are distinct. */
(() => {
  'use strict';
  const ui = AdminUI,
    e = ui.esc,
    money = HobbyHubService.money;
  function receipt(row) {
    const holder = HobbyHubService.snapshot().organizers.find((o) => o.id === row.organizerId);
    ui.dialog(
      'Settlement receipt',
      `<div class="settlementReceipt"><span class="settlementReceiptIcon" aria-hidden="true">✓</span><p class="settlementEyebrow">${row.simulated ? 'TRANSFER PREVIEW' : 'EXTERNAL TRANSFER RECORDED'}</p><h3>${e(money(row.settledAmountFils || row.payableFils))}</h3><p>${e(holder?.name)}</p></div><dl class="settlementDetails"><dt>Recipient</dt><dd>${e(row.recipientSnapshot?.name || 'Not recorded')}</dd><dt>Method</dt><dd>${e(row.recipientSnapshot?.method || 'Not recorded')}</dd><dt>Reference</dt><dd>${e(row.transferReference || 'Legacy record — no reference')}</dd><dt>Date</dt><dd>${e(row.transferDate || row.paidAt || '—')}</dd></dl>${row.simulated ? '<p class="settlementPreviewNote">Preview only. No money was sent.</p>' : ''}`,
    );
  }
  function open(id, refresh) {
    let quote;
    try {
      quote = SettlementService.details(id);
    } catch (error) {
      ui.toast(error.message);
      return;
    }
    if (quote.status !== 'pending') return receipt(quote);
    const organizer = HobbyHubService.snapshot().organizers.find((o) => o.id === quote.organizerId),
      saved = organizer?.payoutRecipient || {};
    const dialog = ui.dialog(
      'Settle organizer payout',
      `<ol class="settlementSteps" aria-label="Settlement steps"><li class="isCurrent" data-step="1">1 · Recipient</li><li data-step="2">2 · Review</li></ol><form id="settlementForm"><section id="settlementRecipient"><div class="settlementIntro"><span class="settlementOrganizerIcon" aria-hidden="true">↗</span><div><h3>${e(organizer?.name)}</h3><p>Review who receives the booking proceeds.</p></div><strong>${e(money(quote.payableFils))}</strong></div><div class="adminFormGrid"><div class="adminField adminFull"><label for="settleName">Account holder / wallet owner</label><input id="settleName" value="${e(saved.name || '')}" required maxlength="120" autocomplete="off"></div><div class="adminField"><label for="settleMethod">Transfer method</label><select id="settleMethod"><option value="bank">Bank transfer (IBAN)</option><option value="wallet">Mobile wallet</option><option value="cliq">CliQ</option></select></div><div class="adminField"><label for="settleProvider">Receiving bank / wallet provider</label><input id="settleProvider" value="${e(saved.provider || '')}" required autocomplete="off"></div><div class="adminField adminFull"><label for="settleIdentifier" id="settleIdentifierLabel">IBAN</label><input id="settleIdentifier" value="${e(saved.identifier || '')}" required autocomplete="off" maxlength="80"></div><label class="settlementCheck adminFull"><input type="checkbox" id="settleRecipientChecked" required> I checked these recipient details with the organizer.</label></div><div class="adminFormActions"><button type="button" class="adminBtn" id="settleNext">Review payout →</button></div></section><section id="settlementReview" hidden><div class="settlementAmount"><p>Amount to the organizer</p><strong>${e(money(quote.payableFils))}</strong></div><div id="settlementPayeeReview"></div><dl class="settlementBreakdown"><dt>Paid bookings</dt><dd>${e(money(quote.grossFils))}</dd><dt>HobbyHub commission</dt><dd>− ${e(money(quote.commissionFils))}</dd><dt>Organizer receives</dt><dd>${e(money(quote.payableFils))}</dd></dl><p class="adminMuted">Advertising and listing charges are billed separately.</p><div class="adminField"><label for="settleMode">Complete this settlement</label><select id="settleMode"><option value="preview">Preview the transfer flow</option><option value="external">Record a transfer already completed</option></select></div><p class="settlementPreviewNote" id="settlePreviewNote">Frontend preview: this does not send money. A real transfer requires the payment-provider connection.</p><div id="settleExternalFields" hidden><div class="adminFormGrid"><div class="adminField"><label for="settleReference">Bank / wallet transfer reference</label><input id="settleReference" minlength="3" maxlength="100"></div><div class="adminField"><label for="settleDate">Transfer date</label><input id="settleDate" type="date" max="${new Date().toISOString().slice(0, 10)}"></div><label class="settlementCheck adminFull"><input type="checkbox" id="settleExternalCompleted"> I completed this transfer outside HobbyHub.</label></div></div><div class="adminField"><label for="settleNotes">Settlement notes (optional)</label><textarea id="settleNotes" rows="2" maxlength="500"></textarea></div><label class="settlementCheck"><input type="checkbox" id="settleReviewChecked"> I confirm the recipient and the amount shown above.</label><div class="adminFormActions"><button type="button" class="adminBtn secondary" id="settleBack">← Back</button><button type="submit" class="adminBtn" id="settleSubmit">Complete preview</button></div></section><p id="settlementError" class="adminFormError" role="alert" hidden></p></form>`,
    );
    const form = dialog.querySelector('#settlementForm'),
      method = dialog.querySelector('#settleMethod'),
      error = dialog.querySelector('#settlementError');
    let recipient;
    method.value = saved.method || 'bank';
    const updateLabel = () => {
      dialog.querySelector('#settleIdentifierLabel').textContent =
        method.value === 'bank'
          ? 'IBAN'
          : method.value === 'wallet'
            ? 'Wallet phone number'
            : 'CliQ alias / registered email or phone';
    };
    updateLabel();
    method.addEventListener('change', updateLabel);
    const readRecipient = () => ({
      name: dialog.querySelector('#settleName').value,
      method: method.value,
      provider: dialog.querySelector('#settleProvider').value,
      identifier: dialog.querySelector('#settleIdentifier').value,
      checkedWithOrganizer: dialog.querySelector('#settleRecipientChecked').checked,
    });
    function showStep(review) {
      if (review) {
        dialog.querySelector('#settleReviewChecked').checked = false;
        dialog.querySelector('#settleExternalCompleted').checked = false;
      }
      dialog.querySelector('#settlementRecipient').hidden = review;
      dialog.querySelector('#settlementReview').hidden = !review;
      dialog
        .querySelectorAll('[data-step]')
        .forEach((n) => n.classList.toggle('isCurrent', n.dataset.step === (review ? '2' : '1')));
      error.hidden = true;
    }
    dialog.querySelector('#settleNext').addEventListener('click', () => {
      try {
        recipient = SettlementService.validateRecipient(readRecipient());
        const latest = SettlementService.details(id);
        if (latest.payableFils !== quote.payableFils || latest.status !== 'pending')
          throw Error('This payout changed. Close and review it again.');
        dialog.querySelector('#settlementPayeeReview').innerHTML =
          `<div class="settlementPayee"><strong>${e(recipient.name)}</strong><span>${e(recipient.provider)} · ${e(recipient.method)}</span><code>${e(recipient.identifier)}</code></div>`;
        showStep(true);
        dialog.querySelector('#settleMode').focus();
      } catch (problem) {
        error.textContent = problem.message;
        error.hidden = false;
      }
    });
    dialog.querySelector('#settleBack').addEventListener('click', () => {
      showStep(false);
      dialog.querySelector('#settleName').focus();
    });
    const mode = dialog.querySelector('#settleMode');
    function modeChanged() {
      const external = mode.value === 'external';
      dialog.querySelector('#settleExternalFields').hidden = !external;
      dialog.querySelector('#settlePreviewNote').hidden = external;
      dialog.querySelector('#settleReference').required = external;
      dialog.querySelector('#settleDate').required = external;
      dialog.querySelector('#settleExternalCompleted').required = external;
      for (const key of ['#settleReference', '#settleDate', '#settleExternalCompleted'])
        dialog.querySelector(key).disabled = !external;
      dialog.querySelector('#settleSubmit').textContent = external
        ? 'Record completed transfer'
        : 'Complete preview';
    }
    mode.addEventListener('change', modeChanged);
    modeChanged();
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (dialog.querySelector('#settlementReview').hidden) {
        dialog.querySelector('#settleNext').click();
        return;
      }
      const button = dialog.querySelector('#settleSubmit');
      button.disabled = true;
      try {
        const result = await SettlementService.complete(id, {
          recipient: readRecipient(),
          expectedAmountFils: quote.payableFils,
          mode: mode.value,
          confirmedReview: dialog.querySelector('#settleReviewChecked').checked,
          reference: dialog.querySelector('#settleReference').value,
          paidOn: dialog.querySelector('#settleDate').value,
          externalTransferCompleted: dialog.querySelector('#settleExternalCompleted').checked,
          notes: dialog.querySelector('#settleNotes').value,
        });
        dialog.close();
        refresh();
        receipt(result);
      } catch (problem) {
        error.textContent = problem.message;
        error.hidden = false;
      } finally {
        button.disabled = false;
      }
    });
  }
  function recordInvoice(invoiceId, refresh) {
    const s = HobbyHubService.snapshot(),
      invoice = s.invoices.find((i) => i.id === invoiceId),
      organizer = s.organizers.find((o) => o.id === invoice?.organizerId);
    if (!invoice) {
      ui.toast('Invoice not found.');
      return;
    }
    const dialog = ui.dialog(
      'Record organizer payment',
      `<div class="settlementAmount"><p>${e(invoice.number)} · ${e(organizer?.name)}</p><strong>${e(money(invoice.amountFils))}</strong></div><form id="invoiceReceiptForm" class="adminSettingsForm"><div class="adminField"><label for="receiptMethod">Payment received through</label><select id="receiptMethod"><option value="bank">Bank transfer</option><option value="wallet">Mobile wallet</option><option value="cliq">CliQ</option></select></div><div class="adminField"><label for="receiptReference">Payment reference</label><input id="receiptReference" required minlength="3" maxlength="100"></div><div class="adminField"><label for="receiptDate">Date received</label><input id="receiptDate" type="date" required max="${new Date().toISOString().slice(0, 10)}"></div><div class="adminField"><label for="receiptNotes">Notes (optional)</label><textarea id="receiptNotes" rows="2"></textarea></div><label class="settlementCheck"><input type="checkbox" id="receiptConfirmed" required> I confirmed receipt of this amount from the organizer.</label><p id="receiptError" class="adminFormError" role="alert" hidden></p><button class="adminBtn" type="submit">Save payment receipt</button></form>`,
    );
    dialog.querySelector('#invoiceReceiptForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await recordOrganizerPayment(invoiceId, {
          expectedAmountFils: invoice.amountFils,
          method: dialog.querySelector('#receiptMethod').value,
          reference: dialog.querySelector('#receiptReference').value,
          receivedOn: dialog.querySelector('#receiptDate').value,
          notes: dialog.querySelector('#receiptNotes').value,
          receiptConfirmed: dialog.querySelector('#receiptConfirmed').checked,
        });
        dialog.close();
        refresh();
        ui.toast('Payment receipt saved. Invoice and charge updated.');
      } catch (error) {
        const node = dialog.querySelector('#receiptError');
        node.textContent = error.message;
        node.hidden = false;
      }
    });
  }
  window.AdminSettlement = Object.freeze({ open, receipt, recordInvoice });
})();
