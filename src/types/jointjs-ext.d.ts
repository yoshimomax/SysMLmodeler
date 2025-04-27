// JointJS type extensions

import * as joint from 'jointjs';

declare module 'jointjs' {
  namespace shapes {
    namespace sysml {
      // Base class for all SysML elements
      class Base extends joint.dia.Element {
        defaults: Required<joint.shapes.basic.Rect>['defaults'];
      }
      
      // SysML element shapes
      class PartDefinition extends Base {
        defaults: Required<Base>['defaults'];
      }
      
      class InterfaceDefinition extends Base {
        defaults: Required<Base>['defaults'];
      }
      
      class ActionDefinition extends Base {
        defaults: Required<Base>['defaults'];
      }
      
      class StateDefinition extends Base {
        defaults: Required<Base>['defaults'];
      }
      
      class AttributeDefinition extends Base {
        defaults: Required<Base>['defaults'];
      }
      
      // SysML relationship links
      class Specialization extends joint.dia.Link {
        defaults: Required<joint.dia.Link>['defaults'];
      }
      
      class FeatureMembership extends joint.dia.Link {
        defaults: Required<joint.dia.Link>['defaults'];
      }
      
      class Connection extends joint.dia.Link {
        defaults: Required<joint.dia.Link>['defaults'];
      }
      
      class Transition extends joint.dia.Link {
        defaults: Required<joint.dia.Link>['defaults'];
      }
    }
  }
}