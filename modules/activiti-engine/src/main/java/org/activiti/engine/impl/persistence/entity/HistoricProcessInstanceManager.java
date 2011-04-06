/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.activiti.engine.impl.persistence.entity;

import java.util.List;

import org.activiti.engine.history.HistoricProcessInstance;
import org.activiti.engine.impl.HistoricProcessInstanceQueryImpl;
import org.activiti.engine.impl.Page;
import org.activiti.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.activiti.engine.impl.context.Context;
import org.activiti.engine.impl.interceptor.CommandContext;
import org.activiti.engine.impl.persistence.AbstractHistoricManager;
import org.activiti.engine.repository.ProcessDefinition;


/**
 * @author Tom Baeyens
 */
public class HistoricProcessInstanceManager extends AbstractHistoricManager {

  public HistoricProcessInstanceEntity findHistoricProcessInstance(String processInstanceId) {
    return (HistoricProcessInstanceEntity) getPersistenceSession().selectById(HistoricProcessInstanceEntity.class, processInstanceId);
  }

  public void deleteHistoricProcessInstancesByProcessDefinition(ProcessDefinition processDefinition) {
    List<HistoricProcessInstance> historicProcessInstances = getPersistenceSession()
      .createHistoricProcessInstanceQuery()
      .processDefinitionId(processDefinition.getId())
      .list();
    
    for (HistoricProcessInstance historicProcessInstance: historicProcessInstances) {
      deleteHistoricProcessInstance(historicProcessInstance.getId());
    }
  }
  
  public void deleteHistoricProcessInstance(String historicProcessInstanceId) {
    CommandContext commandContext = Context.getCommandContext();
    
    commandContext
      .getHistoricDetailManager()
      .deleteHistoricDetailsByProcessInstanceId(historicProcessInstanceId);
    
    commandContext
      .getHistoricActivityInstanceManager()
      .deleteHistoricActivityInstancesByProcessInstanceId(historicProcessInstanceId);

    commandContext
      .getHistoricTaskInstanceManager()
      .deleteHistoricTaskInstancesByProcessInstanceId(historicProcessInstanceId);

    if (historyLevel>ProcessEngineConfigurationImpl.HISTORYLEVEL_NONE) {
      getPersistenceSession().delete(HistoricProcessInstanceEntity.class, historicProcessInstanceId);
    }
  }
  
  public long findHistoricProcessInstanceCountByQueryCriteria(HistoricProcessInstanceQueryImpl historicProcessInstanceQuery) {
    return (Long) getPersistenceSession().selectOne("selectHistoricProcessInstanceCountByQueryCriteria", historicProcessInstanceQuery);
  }

  @SuppressWarnings("unchecked")
  public List<HistoricProcessInstance> findHistoricProcessInstancesByQueryCriteria(HistoricProcessInstanceQueryImpl historicProcessInstanceQuery, Page page) {
    return getPersistenceSession().selectList("selectHistoricProcessInstancesByQueryCriteria", historicProcessInstanceQuery, page);
  }


}