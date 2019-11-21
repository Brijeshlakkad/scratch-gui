import classNames from 'classnames';
import omit from 'lodash.omit';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import MediaQuery from 'react-responsive';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import tabStyles from 'react-tabs/style/react-tabs.css';
import VM from 'scratch-vm';
import Renderer from 'scratch-render';

import Blocks from '../../containers/blocks.jsx';
import CostumeTab from '../../containers/costume-tab.jsx';
import TargetPane from '../../containers/target-pane.jsx';
import SoundTab from '../../containers/sound-tab.jsx';
import StageWrapper from '../../containers/stage-wrapper.jsx';
import Loader from '../loader/loader.jsx';
import Box from '../box/box.jsx';
import MenuBar from '../menu-bar/menu-bar.jsx';
import CostumeLibrary from '../../containers/costume-library.jsx';
import BackdropLibrary from '../../containers/backdrop-library.jsx';
import Watermark from '../../containers/watermark.jsx';

import Backpack from '../../containers/backpack.jsx';
import WebGlModal from '../../containers/webgl-modal.jsx';
import TipsLibrary from '../../containers/tips-library.jsx';
import Cards from '../../containers/cards.jsx';
import Alerts from '../../containers/alerts.jsx';
import DragLayer from '../../containers/drag-layer.jsx';
import ConnectionModal from '../../containers/connection-modal.jsx';
import TelemetryModal from '../telemetry-modal/telemetry-modal.jsx';

import layout, {STAGE_SIZE_MODES} from '../../lib/layout-constants';
import {resolveStageSize} from '../../lib/screen-utils';

import styles from './gui.css';
import addExtensionIcon from './icon--extensions.svg';
import codeIcon from './icon--code.svg';
import costumesIcon from './icon--costumes.svg';
import soundsIcon from './icon--sounds.svg';

const messages = defineMessages({
    addExtension: {
        id: 'gui.gui.addExtension',
        description: 'Button to add an extension in the target pane',
        defaultMessage: 'Add Extension'
    }
});

// Cache this value to only retrieve it once the first time.
// Assume that it doesn't change for a session.
let isRendererSupported = null;

const GUIComponent = props => {
    const {
        accountNavOpen,
        activeTabIndex,
        alertsVisible,
        authorId,
        authorThumbnailUrl,
        authorUsername,
        basePath,
        backdropLibraryVisible,
        backpackHost,
        backpackVisible,
        blocksTabVisible,
        cardsVisible,
        canChangeLanguage,
        canCreateNew,
        canEditTitle,
        canManageFiles,
        canRemix,
        canSave,
        canCreateCopy,
        canShare,
        canUseCloud,
        children,
        connectionModalVisible,
        costumeLibraryVisible,
        costumesTabVisible,
        enableCommunity,
        intl,
        isCreating,
        isFullScreen,
        isPlayerOnly,
        isRtl,
        isShared,
        loading,
        logo,
        renderLogin,
        onClickAccountNav,
        onCloseAccountNav,
        onLogOut,
        onOpenRegistration,
        onToggleLoginOpen,
        onActivateCostumesTab,
        onActivateSoundsTab,
        onActivateTab,
        onClickLogo,
        onExtensionButtonClick,
        onProjectTelemetryEvent,
        onRequestCloseBackdropLibrary,
        onRequestCloseCostumeLibrary,
        onRequestCloseTelemetryModal,
        onSeeCommunity,
        onShare,
        onTelemetryModalCancel,
        onTelemetryModalOptIn,
        onTelemetryModalOptOut,
        showComingSoon,
        soundsTabVisible,
        stageSizeMode,
        targetIsStage,
        telemetryModalVisible,
        tipsLibraryVisible,
        vm,
        newblocklist,
        fieldChildren,
        inputChildren,
        operandInputList,
        numInputList,
        procedureList,
        ...componentProps
    } = omit(props, 'dispatch');
    if (children) {
        return <Box {...componentProps}>{children}</Box>;
    }
    const tabClassNames = {
        tabs: styles.tabs,
        tab: classNames(tabStyles.reactTabsTab, styles.tab),
        tabList: classNames(tabStyles.reactTabsTabList, styles.tabList),
        tabPanel: classNames(tabStyles.reactTabsTabPanel, styles.tabPanel),
        tabPanelSelected: classNames(tabStyles.reactTabsTabPanelSelected, styles.isSelected),
        tabSelected: classNames(tabStyles.reactTabsTabSelected, styles.isSelected)
    };

    if (isRendererSupported === null) {
        isRendererSupported = Renderer.isSupported();
    }
    function onCreateNewProject(){
      if(newblocklist){
        while(newblocklist.length > 0){
          newblocklist.pop();
        }
      }
    }
    function handleBlockCreate(newBlocks){
      // console.log(newBlocks);
      newBlocks.forEach(function(newBlock, index){
        newblocklist.push(newBlock);
      });
    }
    // To check if block exists on the list or not
    function hasBeenAddedAlready(newblocklist,block){
      let flag = false;
      newblocklist.forEach(function(newblock, index){
        if(block['id'] == newblock['id']){
          flag = true;
        }
      });
      return flag;
    }
    // handler of BLOCK_DRAG_UPDATE
    function handleBlockDragUpdate (areBlocksOverGui, block) {
      // if((props.newblocklist.length > 0) || (props.newblocklist.length == 0 && block['opcode'] == "event_whenflagclicked")){
      //   if(!hasBeenAddedAlready(props.newblocklist, block)){
      //     props.newblocklist.push(block);
      //   }
      // }
      // console.log(block);
      console.log(block);
      if(!hasBeenAddedAlready(newblocklist, block)){
        newblocklist.push(block);
      }
      // showBlocksUsed(props.newblocklist);
      // let i = 0;
      // console.log("Blocks used are:\n")
      //   blocks.forEach(function(block,index){
      //     if(!block['shadow']){
      //       blockList[i] = block['opcode'];
      //       i++;
      //     }
      //   });
      // blockList.forEach(function(block,index){
      //   console.log(block);
      // });
    }
    function getNextBlockId(newBlockList, blockId){
      let nextBlockId;
      newBlockList.forEach(function(newBlock,index){
         if(newBlock['id'] == blockId){
           nextBlockId = newBlock['next'];
         }
      });
      return nextBlockId;
    }
    function getBlock(newBlockList, blockId){
      let block;
      newBlockList.forEach(function(newBlock,index){
         if(newBlock['id'] == blockId){
           block = newBlock;
         }
      });
      return block;
    }
    function findStartingBlock(newBlockList, blockOpcode){
      let eventFlagBlockList = [];
      // console.log("----Starting of findEventFlagBlock----");
      newBlockList.forEach(function(newBlock,index){
        // console.log(newBlock['opcode']);
        if(newBlock['opcode']===blockOpcode){
          eventFlagBlockList.push(newBlock['id']);
          // console.log('set'+eventFlagBlock);
        }
      });
      // console.log("----End of findEventFlagBlock----");
      return eventFlagBlockList;
    }
    function getFieldChild(block){
      let fieldChildName;
      fieldChildren.forEach(function(fieldChild, index){
        if(block['fields'][fieldChild] != null){
          fieldChildName = fieldChild;
        }
      });
      return fieldChildName;
    }
    function getInputChild(block){
      let inputChildList = [];
      let inputType;
      inputChildren.forEach(function(inputChild, index){
        if(block['inputs'][inputChild] != null){
          inputType = 'NORMAL';
          inputChildList.push({"type" : inputType,"childName" : inputChild});
        }
      });
      operandInputList.forEach(function(inputChild, index){
        if(block['inputs'][inputChild] != null){
          inputType = 'OPERAND';
          inputChildList.push({"type" : inputType,"childName" : inputChild});
        }
      });
      numInputList.forEach(function(inputChild, index){
        if(block['inputs'][inputChild] != null){
          inputType = 'NUM';
          inputChildList.push({"type" : inputType,"childName" : inputChild});
        }
      });
      return inputChildList;
    }
    function getProcedureOpcode(block){
      let inputChildName;
      procedureList.forEach(function(inputChild, index){
        if(block['opcode'] == inputChild){
          inputChildName = inputChild;
        }
      });
      return inputChildName;
    }
    function makeTextFromCondition(newBlockList, operandList, inputName){
      let readableTextForThisBlockList = [];
      let readableTextForThisBlock;
      operandList.forEach(function(operandBlockId, index){
         let operandBlock = getBlock(newBlockList, operandBlockId);
         let fieldChild = getFieldChild(operandBlock);
         let inputChildList = getInputChild(operandBlock);
         if(fieldChild == undefined && inputChildList){
           inputChildList.forEach(function(inputChild, index){
             if(inputChild['type']=='NUM'){
               readableTextForThisBlock = parseNumData(newBlockList, operandBlock);
             }else if(inputChild['type']=='OPERAND'){
               readableTextForThisBlock = parseOperandData(newBlockList, operandBlock, inputName);
             }
           });
         }else{
           if(fieldChild){
             readableTextForThisBlock = operandBlock['fields'][fieldChild]['value'];
           }
         }
         readableTextForThisBlockList.push(readableTextForThisBlock);
         readableTextForThisBlock = '';
      });
      return readableTextForThisBlockList;
    }
    function parseNumData(newBlockList, inputBlock){
      let valueList = [];
      let operand = inputBlock['opcode'];
      let readableTextForThisBlock = operand+" of ";
      numInputList.forEach(function(numInput, index){
        valueList.push(inputBlock['inputs'][numInput]['block']);
      });
      valueList.forEach(function(numBlockId, index){
        let numBlock = getBlock(newBlockList, numBlockId);
        let fieldChild = getFieldChild(numBlock);
        let numValue = numBlock['fields'][fieldChild]['value'];
        let numName = numBlock['fields'][fieldChild]['name'];
        if(index==0){
          readableTextForThisBlock += numName+" '"+numValue+"' and ";
        }else{
          readableTextForThisBlock += numName+" "+numValue;
        }
      });
      return readableTextForThisBlock;
    }
    function parseOperandData(newBlockList, inputBlock, inputName){
      let operandList = [];
      let conditionName = inputBlock['opcode'];
      let readableTextForThisBlock = inputName + " of "+ conditionName + " on ";
      let conditionInputChildList = getInputChild(inputBlock);
      if(conditionInputChildList && conditionInputChildList[0]['type']=='OPERAND'){
        operandInputList.forEach(function(operandInput, index){
          operandList.push(inputBlock['inputs'][operandInput]['block']);
        })
      }
      makeTextFromCondition(newBlockList,operandList, inputName).forEach(function(readBlock, index){
        if(index==0){
          readableTextForThisBlock += readBlock+" with "
        }else{
          readableTextForThisBlock += readBlock;
        }
      });
      return readableTextForThisBlock;
    }
    function parseFieldData(block, fieldChild){
      let fieldName = block['fields'][fieldChild]['name'];
      let fieldValue = block['fields'][fieldChild]['value'];
      return fieldName+" is "+fieldValue+"\n";
    }
    function parseProceduresCallBlock(newBlockList, block){
      let readableTextForThisBlock = '';
      let argumentids = JSON.parse(block['mutation']['argumentids']);
      argumentids.forEach(function(argumentId, index){
        let childBlock = getBlock(newBlockList,block['inputs'][argumentId]['block']);
        let fieldChild = getFieldChild(childBlock);
        if(fieldChild && childBlock['fields'][fieldChild] != null){
          readableTextForThisBlock += parseFieldData(childBlock, fieldChild);
        }
      });
      let proccode = block['mutation']['proccode'];
      let procedureNamePattern = /([a-zA-Z_{1}][a-zA-Z0-9_]+?)\s/;
      let result = proccode.match(procedureNamePattern);
      readableTextForThisBlock = result[0]+" procedure has "+argumentids.length+" arguments"+", which are:\n"+readableTextForThisBlock;
      return readableTextForThisBlock;
    }
    function parseNormalBlock(newBlockList, block){
      let readableTextForThisBlock = '';
      let _this = this;
      if(block['fields'] != null){
        let fieldChild = getFieldChild(block);
        if(fieldChild && block['fields'][fieldChild] != null){
          readableTextForThisBlock += parseFieldData(block, fieldChild);
        }
      }
      if(block['inputs'] != null){
        let inputChildList = getInputChild(block);
        if(inputChildList){
          inputChildList.forEach(function(inputChild, index){
            let inputBlockId = block['inputs'][inputChild['childName']]['block'];
            let inputName = block['inputs'][inputChild['childName']]['name'];
            let inputBlock = getBlock(newBlockList, inputBlockId);
            if(inputChild['type']=='NORMAL'){
              let normalFieldChild = getFieldChild(inputBlock);
              if(normalFieldChild && inputBlock['fields'][normalFieldChild] != null){
                readableTextForThisBlock += parseFieldData(inputBlock, normalFieldChild);
              }
            }
            if(inputChild['childName'] == 'CONDITION'){
              readableTextForThisBlock += parseOperandData(newBlockList, inputBlock, inputName);
            }
          });
        }
      }
      return readableTextForThisBlock;
    }
    function parseBlock(newBlockList, block){
      let child = getProcedureOpcode(block);
      if(child){
        if(child == "procedures_definition"){
          return parseBlock(newBlockList, getBlock(newBlockList, block['inputs']['custom_block']['block']));
        }
        return parseProceduresCallBlock(newBlockList, block);
      }else{
        return parseNormalBlock(newBlockList, block);
      }
    }
    function handleCallCount(count){
      let printableCallCount = "";
      while(count>0){
        printableCallCount+="\t";
        count--;
      }
      return printableCallCount;
    }
    function parseBlockWith(newBlockList, blockId, count, callCount, isSubstack){
      if(blockId){
        let nextBlockId;
        let prevBlockId = blockId;
        let block = getBlock(newBlockList, blockId);
        let readableTextForThisBlock = parseBlock(newBlockList, block);
        let printableCallCount = handleCallCount(callCount[callCount.length-1]);
        console.log(printableCallCount+count+". "+block['opcode']+": "+readableTextForThisBlock);
        if(block['inputs']['SUBSTACK'] != null){
          let newCallCount = [];
          callCount.forEach(function(ele,index){
            newCallCount.push(ele);
          });
          newCallCount.push(callCount.length);
          // console.log("SUBSTACK: "+blockId);
          nextBlockId = parseBlockWith(newBlockList, block['inputs']['SUBSTACK']['block'], 1, newCallCount, true);
          // console.log("SUBSTACK: "+nextBlockId);
        }
        if(block['next'] != null){
          let newCallCount = [];
          callCount.forEach(function(ele,index){
            newCallCount.push(ele);
          });
          // console.log("NORMAL: "+blockId);
          nextBlockId = parseBlockWith(newBlockList, getNextBlockId(newBlockList, blockId), count+1, newCallCount, false);
          // console.log("NORMAL: "+nextBlockId);
        }
        return nextBlockId;
      }
      return null;
    }
    function showBlocksUsed(newBlockList){
      // console.log("------------");
      // console.log(newBlockList);
      // console.log("------------");
      let nextBlockId = null;
      if(newBlockList != null){
        let eventFlagBlockList = findStartingBlock(newBlockList, 'event_whenflagclicked');
        eventFlagBlockList.forEach(function(eventFlagBlockId,index){
          if(newBlockList != null){
            console.log("Blocked used for event block "+(index+1)+" are:\n");
            nextBlockId = getNextBlockId(newBlockList, eventFlagBlockId);
          }
          parseBlockWith(newBlockList, nextBlockId, 1, [0], false);
        });
        let procedureBlockList = findStartingBlock(newBlockList, 'procedures_definition');
        procedureBlockList.forEach(function(procedureBlockId,index){
          if(newBlockList != null){
            console.log("Blocked used for procedure  "+(index+1)+" are:\n");
          }
          parseBlockWith(newBlockList, procedureBlockId, 1, [0], false);
        });
      }
    }
    function handleProjectStart(){
      showBlocksUsed(newblocklist);
    }
    return (<MediaQuery minWidth={layout.fullSizeMinWidth}>{isFullSize => {
        const stageSize = resolveStageSize(stageSizeMode, isFullSize);

        return isPlayerOnly ? (
            <StageWrapper
                isFullScreen={isFullScreen}
                isRendererSupported={isRendererSupported}
                isRtl={isRtl}
                loading={loading}
                stageSize={STAGE_SIZE_MODES.large}
                vm={vm}
            >
                {alertsVisible ? (
                    <Alerts className={styles.alertsContainer} />
                ) : null}
            </StageWrapper>
        ) : (
            <Box
                className={styles.pageWrapper}
                dir={isRtl ? 'rtl' : 'ltr'}
                {...componentProps}
            >
                {telemetryModalVisible ? (
                    <TelemetryModal
                        onCancel={onTelemetryModalCancel}
                        onOptIn={onTelemetryModalOptIn}
                        onOptOut={onTelemetryModalOptOut}
                        onRequestClose={onRequestCloseTelemetryModal}
                    />
                ) : null}
                {loading ? (
                    <Loader />
                ) : null}
                {isCreating ? (
                    <Loader messageId="gui.loader.creating" />
                ) : null}
                {isRendererSupported ? null : (
                    <WebGlModal isRtl={isRtl} />
                )}
                {tipsLibraryVisible ? (
                    <TipsLibrary />
                ) : null}
                {cardsVisible ? (
                    <Cards />
                ) : null}
                {alertsVisible ? (
                    <Alerts className={styles.alertsContainer} />
                ) : null}
                {connectionModalVisible ? (
                    <ConnectionModal
                        vm={vm}
                    />
                ) : null}
                {costumeLibraryVisible ? (
                    <CostumeLibrary
                        vm={vm}
                        onRequestClose={onRequestCloseCostumeLibrary}
                    />
                ) : null}
                {backdropLibraryVisible ? (
                    <BackdropLibrary
                        vm={vm}
                        onRequestClose={onRequestCloseBackdropLibrary}
                    />
                ) : null}
                <MenuBar
                    accountNavOpen={accountNavOpen}
                    authorId={authorId}
                    authorThumbnailUrl={authorThumbnailUrl}
                    authorUsername={authorUsername}
                    canChangeLanguage={canChangeLanguage}
                    canCreateCopy={canCreateCopy}
                    canCreateNew={canCreateNew}
                    canEditTitle={canEditTitle}
                    canManageFiles={canManageFiles}
                    canRemix={canRemix}
                    canSave={canSave}
                    canShare={canShare}
                    className={styles.menuBarPosition}
                    enableCommunity={enableCommunity}
                    isShared={isShared}
                    logo={logo}
                    renderLogin={renderLogin}
                    showComingSoon={showComingSoon}
                    onClickAccountNav={onClickAccountNav}
                    onClickLogo={onClickLogo}
                    onCloseAccountNav={onCloseAccountNav}
                    onLogOut={onLogOut}
                    onOpenRegistration={onOpenRegistration}
                    onProjectTelemetryEvent={onProjectTelemetryEvent}
                    onSeeCommunity={onSeeCommunity}
                    onShare={onShare}
                    onToggleLoginOpen={onToggleLoginOpen}
                    onCreateNewProject={onCreateNewProject}
                />
                <Box className={styles.bodyWrapper}>
                    <Box className={styles.flexWrapper}>
                        <Box className={styles.editorWrapper}>
                            <Tabs
                                forceRenderTabPanel
                                className={tabClassNames.tabs}
                                selectedIndex={activeTabIndex}
                                selectedTabClassName={tabClassNames.tabSelected}
                                selectedTabPanelClassName={tabClassNames.tabPanelSelected}
                                onSelect={onActivateTab}
                            >
                                <TabList className={tabClassNames.tabList}>
                                    <Tab className={tabClassNames.tab}>
                                        <img
                                            draggable={false}
                                            src={codeIcon}
                                        />
                                        <FormattedMessage
                                            defaultMessage="Code"
                                            description="Button to get to the code panel"
                                            id="gui.gui.codeTab"
                                        />
                                    </Tab>
                                    <Tab
                                        className={tabClassNames.tab}
                                        onClick={onActivateCostumesTab}
                                    >
                                        <img
                                            draggable={false}
                                            src={costumesIcon}
                                        />
                                        {targetIsStage ? (
                                            <FormattedMessage
                                                defaultMessage="Backdrops"
                                                description="Button to get to the backdrops panel"
                                                id="gui.gui.backdropsTab"
                                            />
                                        ) : (
                                            <FormattedMessage
                                                defaultMessage="Costumes"
                                                description="Button to get to the costumes panel"
                                                id="gui.gui.costumesTab"
                                            />
                                        )}
                                    </Tab>
                                    <Tab
                                        className={tabClassNames.tab}
                                        onClick={onActivateSoundsTab}
                                    >
                                        <img
                                            draggable={false}
                                            src={soundsIcon}
                                        />
                                        <FormattedMessage
                                            defaultMessage="Sounds"
                                            description="Button to get to the sounds panel"
                                            id="gui.gui.soundsTab"
                                        />
                                    </Tab>
                                </TabList>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    <Box className={styles.blocksWrapper}>
                                        <Blocks
                                            canUseCloud={canUseCloud}
                                            grow={1}
                                            isVisible={blocksTabVisible}
                                            handleBlockCreate={handleBlockCreate}
                                            handleBlockDragUpdate={handleBlockDragUpdate}
                                            handleProjectStart={handleProjectStart}
                                            options={{
                                                media: `${basePath}static/blocks-media/`
                                            }}
                                            stageSize={stageSize}
                                            vm={vm}
                                        />
                                    </Box>
                                    <Box className={styles.extensionButtonContainer}>
                                        <button
                                            className={styles.extensionButton}
                                            title={intl.formatMessage(messages.addExtension)}
                                            onClick={onExtensionButtonClick}
                                        >
                                            <img
                                                className={styles.extensionButtonIcon}
                                                draggable={false}
                                                src={addExtensionIcon}
                                            />
                                        </button>
                                    </Box>
                                    <Box className={styles.watermark}>
                                        <Watermark />
                                    </Box>
                                </TabPanel>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    {costumesTabVisible ? <CostumeTab vm={vm} /> : null}
                                </TabPanel>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    {soundsTabVisible ? <SoundTab vm={vm} /> : null}
                                </TabPanel>
                            </Tabs>
                            {backpackVisible ? (
                                <Backpack host={backpackHost} />
                            ) : null}
                        </Box>

                        <Box className={classNames(styles.stageAndTargetWrapper, styles[stageSize])}>
                            <StageWrapper
                                isRendererSupported={isRendererSupported}
                                isRtl={isRtl}
                                stageSize={stageSize}
                                vm={vm}
                            />
                            <Box className={styles.targetWrapper}>
                                <TargetPane
                                    stageSize={stageSize}
                                    vm={vm}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <DragLayer />
            </Box>
        );
    }}</MediaQuery>);
};

GUIComponent.propTypes = {
    accountNavOpen: PropTypes.bool,
    activeTabIndex: PropTypes.number,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
    backdropLibraryVisible: PropTypes.bool,
    backpackHost: PropTypes.string,
    backpackVisible: PropTypes.bool,
    basePath: PropTypes.string,
    blocksTabVisible: PropTypes.bool,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    canUseCloud: PropTypes.bool,
    cardsVisible: PropTypes.bool,
    children: PropTypes.node,
    costumeLibraryVisible: PropTypes.bool,
    costumesTabVisible: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    intl: intlShape.isRequired,
    isCreating: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    loading: PropTypes.bool,
    logo: PropTypes.string,
    onActivateCostumesTab: PropTypes.func,
    onActivateSoundsTab: PropTypes.func,
    onActivateTab: PropTypes.func,
    onClickAccountNav: PropTypes.func,
    onClickLogo: PropTypes.func,
    onCloseAccountNav: PropTypes.func,
    onExtensionButtonClick: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onRequestCloseBackdropLibrary: PropTypes.func,
    onRequestCloseCostumeLibrary: PropTypes.func,
    onRequestCloseTelemetryModal: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onTabSelect: PropTypes.func,
    onTelemetryModalCancel: PropTypes.func,
    onTelemetryModalOptIn: PropTypes.func,
    onTelemetryModalOptOut: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    renderLogin: PropTypes.func,
    showComingSoon: PropTypes.bool,
    soundsTabVisible: PropTypes.bool,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    targetIsStage: PropTypes.bool,
    telemetryModalVisible: PropTypes.bool,
    tipsLibraryVisible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired,
    newblocklist: PropTypes.array,
    fieldChildren: PropTypes.array,
    inputChildren: PropTypes.array,
    operandInputList: PropTypes.array,
    numInputList: PropTypes.array,
    procedureList: PropTypes.array
};
GUIComponent.defaultProps = {
    backpackHost: null,
    backpackVisible: false,
    basePath: './',
    canChangeLanguage: true,
    canCreateNew: false,
    canEditTitle: false,
    canManageFiles: true,
    canRemix: false,
    canSave: false,
    canCreateCopy: false,
    canShare: false,
    canUseCloud: false,
    enableCommunity: false,
    isCreating: false,
    isShared: false,
    loading: false,
    showComingSoon: false,
    stageSizeMode: STAGE_SIZE_MODES.large,
    newblocklist: [],
    fieldChildren: ['VARIABLE','TEXT','NUM', 'VALUE'],
    inputChildren: ['VALUE','STEPS','CONDITION','MESSAGE','SECS','TIMES'],
    operandInputList: ['OPERAND1','OPERAND2'],
    numInputList: ['NUM1','NUM2'],
    procedureList: ['procedures_call','procedures_definition','procedures_prototype']
};

const mapStateToProps = state => ({
    // This is the button's mode, as opposed to the actual current state
    stageSizeMode: state.scratchGui.stageSize.stageSize
});

export default injectIntl(connect(
    mapStateToProps
)(GUIComponent));
