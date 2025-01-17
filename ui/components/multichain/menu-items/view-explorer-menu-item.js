import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { getAccountLink } from '@metamask/etherscan-link';

import { MenuItem } from '../../ui/menu';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventLinkType,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { IconName, Text } from '../../component-library';
import {
  getBlockExplorerLinkText,
  getCurrentChainId,
  getRpcPrefsForCurrentProvider,
  getSelectedAddress,
} from '../../../selectors';
import { getURLHostName } from '../../../helpers/utils/util';
import { NETWORKS_ROUTE } from '../../../helpers/constants/routes';

export const ViewExplorerMenuItem = ({
  metricsLocation,
  closeMenu,
  textProps,
}) => {
  const t = useI18nContext();
  const trackEvent = useContext(MetaMetricsContext);
  const history = useHistory();

  const currentAddress = useSelector(getSelectedAddress);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  const addressLink = getAccountLink(currentAddress, chainId, rpcPrefs);

  const { blockExplorerUrl } = rpcPrefs;
  const blockExplorerUrlSubTitle = getURLHostName(blockExplorerUrl);
  const blockExplorerLinkText = useSelector(getBlockExplorerLinkText);
  const openBlockExplorer = () => {
    trackEvent({
      event: MetaMetricsEventName.ExternalLinkClicked,
      category: MetaMetricsEventCategory.Navigation,
      properties: {
        link_type: MetaMetricsEventLinkType.AccountTracker,
        location: metricsLocation,
        url_domain: getURLHostName(addressLink),
      },
    });

    global.platform.openTab({
      url: addressLink,
    });
    closeMenu();
  };

  const routeToAddBlockExplorerUrl = () => {
    history.push(`${NETWORKS_ROUTE}#blockExplorerUrl`);
  };

  const LABEL = t('viewOnExplorer');

  return (
    <MenuItem
      onClick={() => {
        blockExplorerLinkText.firstPart === 'addBlockExplorer'
          ? routeToAddBlockExplorerUrl()
          : openBlockExplorer();

        trackEvent({
          event: MetaMetricsEventName.BlockExplorerLinkClicked,
          category: MetaMetricsEventCategory.Accounts,
          properties: {
            location: metricsLocation,
            chain_id: chainId,
          },
        });

        closeMenu?.();
      }}
      subtitle={blockExplorerUrlSubTitle || null}
      iconName={IconName.Export}
      data-testid="account-list-menu-open-explorer"
    >
      {textProps ? <Text {...textProps}>{LABEL}</Text> : LABEL}
    </MenuItem>
  );
};

ViewExplorerMenuItem.propTypes = {
  metricsLocation: PropTypes.string.isRequired,
  closeMenu: PropTypes.func,
  textProps: PropTypes.object,
};
